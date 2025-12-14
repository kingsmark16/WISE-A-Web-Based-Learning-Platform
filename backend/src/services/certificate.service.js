import { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "node:path";

import { generateCertificateNumber } from "../utils/certNumber.js";
import { uploadBufferToSupabase } from "../storage/certificateStorage.js";

const prisma = new PrismaClient();

// Helper to get VERIFY_BASE - evaluated at runtime
function getVerifyBase() {
  if (process.env.VERIFY_BASE_URL) {
    return process.env.VERIFY_BASE_URL;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return 'https://parsuwise.onrender.com/verify';
  }
  
  return 'http://localhost:5173/verify';
}

console.log(`[cert] INIT: Using PDFKit for certificate generation (no Puppeteer)`);

export async function issueCertificateForCompletion(completionId) {
  const completion = await prisma.courseCompletion.findUnique({
    where: { id: completionId },
    include: { user: true, course: true, certificate: true },
  });
  if (!completion) throw new Error("Completion not found");
  if (completion.certificate) return completion.certificate;

  const certificateNumber = generateCertificateNumber("WISE");
  
  const certificate = await prisma.certificate.create({
    data: {
      certificateNumber,
      certificateUrl: "",
      userId: completion.userId,
      courseId: completion.courseId,
      completionId: completion.id,
    },
  });

  console.log(`[cert] Certificate record created: ${certificateNumber}, starting async generation...`);

  setImmediate(() => {
    generateCertificatePdf(certificate.id, certificateNumber, completion)
      .catch((error) => {
        console.error(`[cert] Unhandled error generating certificate ${certificateNumber}:`, error?.message);
      });
  });

  return certificate;
}

async function generateCertificatePdf(certificateId, certificateNumber, completion, attemptNumber = 1) {
  const MAX_RETRIES = 3;
  
  try {
    console.log(`[cert] START: Generating PDF for ${certificateNumber} (attempt ${attemptNumber}/${MAX_RETRIES})`);
    
    const VERIFY_BASE = getVerifyBase();
    console.log(`[cert] VERIFY_BASE: ${VERIFY_BASE}`);
    
    const verifyUrl = `${VERIFY_BASE}?code=${encodeURIComponent(certificateNumber)}`;
    console.log(`[cert] QR URL: ${verifyUrl}`);
    
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 6 });
    console.log(`[cert] QR Code: Generated`);

    const bgPath = path.resolve(process.cwd(), "src/lib/assets/certificate-bg.png");
    let bgBuffer = null;
    try {
      bgBuffer = await fs.readFile(bgPath);
      console.log(`[cert] BG: Loaded (${bgBuffer.length} bytes)`);
    } catch (e) {
      console.warn(`[cert] BG: Not found - ${e?.message}`);
    }

    console.log(`[cert] PDF: Starting PDFKit render...`);
    const pdfBuffer = await renderPdfWithPdfKit({
      studentName: completion.user.fullName || completion.user.emailAddress,
      courseTitle: completion.course.title,
      certificateNumber,
      qrDataUrl,
      bgBuffer,
    });
    console.log(`[cert] PDF: Rendered (${pdfBuffer.length} bytes)`);

    const publicId = `${completion.courseId}-${certificateNumber}`;
    console.log(`[cert] UPLOAD: Starting to Supabase...`);
    
    const { directUrl } = await uploadBufferToSupabase(pdfBuffer, publicId);
    console.log(`[cert] UPLOAD: Success`);

    console.log(`[cert] DB: Updating certificate URL...`);
    const updated = await prisma.certificate.update({
      where: { id: certificateId },
      data: { certificateUrl: directUrl },
    });

    console.log(`[cert] DONE: Certificate ${certificateNumber} successfully generated`);
    console.log(`[cert] URL: ${directUrl}`);
    return updated;
    
  } catch (error) {
    console.error(`[cert] FAIL (attempt ${attemptNumber}/${MAX_RETRIES}): ${certificateNumber}`);
    console.error(`[cert] ERROR: ${error?.message}`);

    if (attemptNumber < MAX_RETRIES) {
      const delay = Math.pow(2, attemptNumber) * 5000;
      console.log(`[cert] RETRY: Waiting ${delay}ms before retry ${attemptNumber + 1}...`);
      
      setTimeout(() => {
        generateCertificatePdf(certificateId, certificateNumber, completion, attemptNumber + 1)
          .catch((retryError) => {
            console.error(`[cert] FINAL FAIL: ${certificateNumber} - ${retryError?.message}`);
          });
      }, delay);
    } else {
      console.error(`[cert] ABORT: Max retries reached for ${certificateNumber}`);
    }
  }
}

async function renderPdfWithPdfKit({ studentName, courseTitle, certificateNumber, qrDataUrl, bgBuffer }) {
  return new Promise((resolve, reject) => {
    try {
      // A4 landscape: 1191 x 842 points (297 x 210 mm)
      const doc = new PDFDocument({
        size: [1191, 842],
        margin: 0,
        bufferPages: true,
      });

      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Draw background image
      if (bgBuffer) {
        try {
          doc.image(bgBuffer, 0, 0, { width: 1191, height: 842 });
        } catch (e) {
          console.warn(`[cert] PDF: Could not draw background - ${e?.message}`);
        }
      }

      
      doc.fontSize(32)
        .font('Helvetica-Bold')
        .text(studentName, 430, 355, {
          width: 660,
          align: 'center'
        });

      doc.fontSize(30)
        .font('Helvetica-Bold')
        .text(courseTitle, 495, 500, {
          width: 525,
          align: 'center',
          lineBreak: true,
        });

      // QR Code box (bottom right)
      const qrX = 73;
      const qrY = 500;

      if (qrDataUrl) {
        try {
          // White border/box for QR code
          doc.rect(qrX - 10, qrY - 10, 200, 200)
            .fillColor('#ffffff')
            .fill();
          
          // Black border
          doc.rect(qrX - 10, qrY - 10, 200, 200)
            .strokeColor('#000000')
            .lineWidth(2)
            .stroke();

          // Draw QR image
          doc.image(qrDataUrl, qrX, qrY, { width: 180, height: 180 });
        } catch (e) {
          console.warn(`[cert] PDF: Could not draw QR code - ${e?.message}`);
        }
      }

      // Certificate number (bottom left)
      doc.fontSize(15)
        .font('Helvetica')
        .fillColor('#fff')
        .text(`Certificate #: ${certificateNumber}`, 22, 720);

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

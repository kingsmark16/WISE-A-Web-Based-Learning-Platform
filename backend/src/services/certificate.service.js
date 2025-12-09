import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "node:path";

import { generateCertificateNumber } from "../utils/certNumber.js";
import { buildCertificateHTML } from "../utils/certTemplate.js";
import { uploadBufferToSupabase } from "../storage/certificateStorage.js";


const VERIFY_BASE = process.env.VERIFY_BASE_URL || (
  process.env.NODE_ENV === 'production' 
    ? 'https://parsuwise.onrender.com/verify'
    : 'http://localhost:5173/verify'
);
const prisma = new PrismaClient();

export async function issueCertificateForCompletion(completionId) {
  const completion = await prisma.courseCompletion.findUnique({
    where: { id: completionId },
    include: { user: true, course: true, certificate: true },
  });
  if (!completion) throw new Error("Completion not found");
  if (completion.certificate) return completion.certificate;

  // 1) Create certificate record FIRST with pending status
  const certificateNumber = generateCertificateNumber("WISE");
  
  const certificate = await prisma.certificate.create({
    data: {
      certificateNumber,
      certificateUrl: "", // Placeholder - will update asynchronously
      userId: completion.userId,
      courseId: completion.courseId,
      completionId: completion.id,
    },
  });

  console.log(`[cert] Certificate record created: ${certificateNumber}, starting async generation...`);

  // 2) Generate PDF asynchronously in background (non-blocking)
  generateCertificatePdf(certificate.id, certificateNumber, completion)
    .catch((error) => {
      console.error(`[cert] Unhandled error generating certificate ${certificateNumber}:`, error);
    });

  // Return immediately with empty URL (frontend will handle gracefully)
  return certificate;
}

async function generateCertificatePdf(certificateId, certificateNumber, completion, attemptNumber = 1) {
  const MAX_RETRIES = 3;
  
  try {
    console.log(`[cert] Generating PDF for ${certificateNumber} (attempt ${attemptNumber}/${MAX_RETRIES})...`);
    
    const verifyUrl = `${VERIFY_BASE}?code=${encodeURIComponent(certificateNumber)}`;
    console.log(`[cert] QR Code URL: ${verifyUrl}`);
    
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 6 });
    console.log(`[cert] QR Code generated for ${certificateNumber}`);

    // Load background image (can be cached)
    const bgPath = path.resolve(process.cwd(), "src/lib/assets/certificate-bg.png");
    let bgDataUrl = "";
    try {
      const buf = await fs.readFile(bgPath);
      bgDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
      console.log(`[cert] Background image loaded (${buf.length} bytes)`);
    } catch (e) {
      console.warn("[cert] Background not found:", bgPath, e?.message);
    }

    // Build HTML
    const html = buildCertificateHTML({
      studentName: completion.user.fullName || completion.user.emailAddress,
      courseTitle: completion.course.title,
      certificateNumber,
      qrDataUrl,
      bgDataUrl,
    });
    console.log(`[cert] HTML built for ${certificateNumber}`);

    // Render PDF
    const pdfBuffer = await renderPdf(html);
    console.log(`[cert] PDF rendered (${pdfBuffer.length} bytes) for ${certificateNumber}`);

    // Upload to storage
    const publicId = `${completion.courseId}-${certificateNumber}`;
    console.log(`[cert] Uploading to Supabase with publicId: ${publicId}`);
    
    const { directUrl } = await uploadBufferToSupabase(pdfBuffer, publicId);
    console.log(`[cert] Upload successful, URL: ${directUrl}`);

    // Update certificate with actual URL
    const updated = await prisma.certificate.update({
      where: { id: certificateId },
      data: { certificateUrl: directUrl },
    });

    console.log(`[cert] ✅ Certificate ${certificateNumber} generated and saved successfully`);
    return updated;
    
  } catch (error) {
    console.error(`[cert] Error in attempt ${attemptNumber}/${MAX_RETRIES} for ${certificateNumber}:`, {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      stack: error?.stack?.split('\n').slice(0, 5).join('\n')
    });

    // Retry logic with exponential backoff
    if (attemptNumber < MAX_RETRIES) {
      const delay = Math.pow(2, attemptNumber) * 5000; // 10s, 20s, 40s
      console.log(`[cert] Retrying in ${delay}ms...`);
      
      setTimeout(() => {
        generateCertificatePdf(certificateId, certificateNumber, completion, attemptNumber + 1)
          .catch((retryError) => {
            console.error(`[cert] Final retry failed for ${certificateNumber}:`, retryError?.message);
          });
      }, delay);
    } else {
      console.error(`[cert] ❌ Max retries (${MAX_RETRIES}) reached for ${certificateNumber}. Certificate URL will remain empty.`);
    }
  }
}

async function renderPdf(html) {
  let browser;
  try {
    console.log("[cert] Launching Puppeteer...");
    
    const launchOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Important for Render to avoid memory issues
      ],
    };

    // On Render, use the bundled Chromium
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      console.log(`[cert] Using custom executable: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
    } else {
      console.log("[cert] Using default/bundled Chromium");
    }

    browser = await puppeteer.launch(launchOptions);
    console.log("[cert] Browser launched successfully");
    
    const page = await browser.newPage();
    console.log("[cert] Setting page content...");
    
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 20000 });
    
    console.log("[cert] Rendering to PDF...");
    const pdfBuffer = await page.pdf({
      printBackground: true,
      landscape: true,
      format: "A4",
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: 10000,
    });
    
    console.log("[cert] PDF rendered successfully");
    return pdfBuffer;
    
  } catch (error) {
    console.error("[cert] PDF rendering failed:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.split('\n').slice(0, 3).join('\n')
    });
    throw error;
    
  } finally {
    if (browser) { 
      try { 
        await browser.close(); 
        console.log("[cert] Browser closed");
      } catch (e) { 
        console.warn("[cert] Error closing browser:", e?.message);
      } 
    }
  }
}

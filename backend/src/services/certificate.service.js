import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "node:path";

import { generateCertificateNumber } from "../utils/certNumber.js";
import { buildCertificateHTML } from "../utils/certTemplate.js";
import { uploadBufferToSupabase } from "../storage/certificateStorage.js";


const VERIFY_BASE = (() => {
  // First, try explicit env variable
  if (process.env.VERIFY_BASE_URL) {
    console.log(`[cert] INIT: Using VERIFY_BASE_URL from env: ${process.env.VERIFY_BASE_URL}`);
    return process.env.VERIFY_BASE_URL;
  }
  
  // Fall back to NODE_ENV check
  if (process.env.NODE_ENV === 'production') {
    console.log(`[cert] INIT: NODE_ENV is production, using https://parsuwise.onrender.com/verify`);
    return 'https://parsuwise.onrender.com/verify';
  }
  
  // Default to localhost
  console.log(`[cert] INIT: Using localhost default: http://localhost:5173/verify`);
  return 'http://localhost:5173/verify';
})();

console.log(`[cert] INIT: VERIFY_BASE = ${VERIFY_BASE}`);
console.log(`[cert] INIT: NODE_ENV = ${process.env.NODE_ENV}`);

const prisma = new PrismaClient();

// Keep track of browser instance to reuse it
let globalBrowser = null;

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
  // Use setImmediate to ensure it runs after response is sent
  setImmediate(() => {
    generateCertificatePdf(certificate.id, certificateNumber, completion)
      .catch((error) => {
        console.error(`[cert] Unhandled error generating certificate ${certificateNumber}:`, error?.message);
      });
  });

  // Return immediately with empty URL (frontend will handle gracefully)
  return certificate;
}

async function generateCertificatePdf(certificateId, certificateNumber, completion, attemptNumber = 1) {
  const MAX_RETRIES = 3;
  
  try {
    console.log(`[cert] START: Generating PDF for ${certificateNumber} (attempt ${attemptNumber}/${MAX_RETRIES})`);
    
    const verifyUrl = `${VERIFY_BASE}?code=${encodeURIComponent(certificateNumber)}`;
    console.log(`[cert] QR URL: ${verifyUrl}`);
    
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 6 });
    console.log(`[cert] QR Code: Generated`);

    // Load background image
    const bgPath = path.resolve(process.cwd(), "src/lib/assets/certificate-bg.png");
    let bgDataUrl = "";
    try {
      const buf = await fs.readFile(bgPath);
      bgDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
      console.log(`[cert] BG: Loaded (${buf.length} bytes)`);
    } catch (e) {
      console.warn(`[cert] BG: Not found at ${bgPath} - ${e?.message}`);
    }

    // Build HTML
    const html = buildCertificateHTML({
      studentName: completion.user.fullName || completion.user.emailAddress,
      courseTitle: completion.course.title,
      certificateNumber,
      qrDataUrl,
      bgDataUrl,
    });
    console.log(`[cert] HTML: Built`);

    // Render PDF
    console.log(`[cert] PDF: Starting render...`);
    const pdfBuffer = await renderPdf(html);
    console.log(`[cert] PDF: Rendered (${pdfBuffer.length} bytes)`);

    // Upload to storage
    const publicId = `${completion.courseId}-${certificateNumber}`;
    console.log(`[cert] UPLOAD: Starting to Supabase...`);
    
    const { directUrl } = await uploadBufferToSupabase(pdfBuffer, publicId);
    console.log(`[cert] UPLOAD: Success`);

    // Update certificate with actual URL
    console.log(`[cert] DB: Updating with URL...`);
    const updated = await prisma.certificate.update({
      where: { id: certificateId },
      data: { certificateUrl: directUrl },
    });

    console.log(`[cert] DONE: Certificate ${certificateNumber} successfully generated`);
    console.log(`[cert] URL: ${directUrl}`);
    return updated;
    
  } catch (error) {
    console.error(`[cert] FAIL (attempt ${attemptNumber}/${MAX_RETRIES}): ${certificateNumber}`);
    console.error(`[cert] ERROR MSG: ${error?.message}`);
    if (error?.code) console.error(`[cert] ERROR CODE: ${error.code}`);
    if (error?.stack) {
      const stackLines = error.stack.split('\n').slice(0, 5);
      stackLines.forEach(line => console.error(`[cert] STACK: ${line}`));
    }

    // Retry logic
    if (attemptNumber < MAX_RETRIES) {
      const delay = Math.pow(2, attemptNumber) * 5000; // 10s, 20s, 40s
      console.log(`[cert] RETRY: Waiting ${delay}ms before retry...`);
      
      setTimeout(() => {
        generateCertificatePdf(certificateId, certificateNumber, completion, attemptNumber + 1)
          .catch((retryError) => {
            console.error(`[cert] FINAL FAIL: ${certificateNumber} - ${retryError?.message}`);
          });
      }, delay);
    } else {
      console.error(`[cert] ABORT: Max retries (${MAX_RETRIES}) reached for ${certificateNumber}`);
    }
  }
}

async function renderPdf(html) {
  let browser;
  let page;
  
  try {
    console.log(`[cert] PUPPETEER: Launching...`);
    
    // Get the browser instance
    browser = await getBrowser();
    
    console.log(`[cert] PUPPETEER: Browser ready`);
    
    page = await browser.newPage();
    console.log(`[cert] PUPPETEER: Page created`);
    
    await page.setContent(html, { 
      waitUntil: "domcontentloaded", 
      timeout: 30000 
    });
    console.log(`[cert] PUPPETEER: Content set`);
    
    const pdfBuffer = await page.pdf({
      printBackground: true,
      landscape: true,
      format: "A4",
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: 30000,
    });
    
    console.log(`[cert] PUPPETEER: PDF generated`);
    
    return pdfBuffer;
    
  } catch (error) {
    console.error(`[cert] PUPPETEER: LAUNCH FAILED`);
    console.error(`[cert] PUPPETEER: ${error?.message}`);
    throw error;
    
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.warn(`[cert] PUPPETEER: Page close error: ${e?.message}`);
      }
    }
    // Don't close browser - keep it alive for reuse
  }
}

async function getBrowser() {
  if (globalBrowser && globalBrowser.connected) {
    console.log(`[cert] PUPPETEER: Reusing browser instance`);
    return globalBrowser;
  }
  
  const launchOptions = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  };

  // Only set executablePath if explicitly provided
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    console.log(`[cert] PUPPETEER: Using custom path from env: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  } else {
    console.log(`[cert] PUPPETEER: No custom path, letting Puppeteer manage Chromium`);
  }

  try {
    globalBrowser = await puppeteer.launch(launchOptions);
    console.log(`[cert] PUPPETEER: Launched successfully`);
    return globalBrowser;
  } catch (error) {
    console.error(`[cert] PUPPETEER: Launch error: ${error?.message}`);
    throw error;
  }
}

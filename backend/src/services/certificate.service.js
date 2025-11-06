import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "node:path";

import { generateCertificateNumber } from "../utils/certNumber.js";
import { buildCertificateHTML } from "../utils/certTemplate.js";
import { uploadBufferToSupabase } from "../storage/certificateStorage.js";

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

  // 2) Generate PDF asynchronously in background (non-blocking)
  setImmediate(async () => {
    try {
      const verifyUrl = `${process.env.VERIFY_BASE_URL}?code=${encodeURIComponent(certificateNumber)}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 6 });

      // Load background image (can be cached)
      const bgPath = path.resolve(process.cwd(), "src/lib/assets/certificate-bg.png");
      let bgDataUrl = "";
      try {
        const buf = await fs.readFile(bgPath);
        bgDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
      } catch (e) {
        console.warn("[cert] background not found:", bgPath, e?.message);
      }

      // Build HTML
      const html = buildCertificateHTML({
        studentName: completion.user.fullName || completion.user.emailAddress,
        courseTitle: completion.course.title,
        certificateNumber,
        qrDataUrl,
        bgDataUrl,
      });

      // Render PDF
      const pdfBuffer = await renderPdf(html);

      // Upload to storage
      const publicId = `${completion.courseId}-${certificateNumber}`;
      const { directUrl } = await uploadBufferToSupabase(pdfBuffer, publicId);

      // Update certificate with actual URL
      await prisma.certificate.update({
        where: { id: certificate.id },
        data: { certificateUrl: directUrl },
      });

      console.log(`[cert] Certificate ${certificateNumber} generated successfully`);
    } catch (error) {
      console.error(`[cert] Failed to generate certificate ${certificateNumber}:`, error);
      // Certificate record exists but URL is empty - can retry later
    }
  });

  // Return immediately with empty URL (frontend will handle gracefully)
  return certificate;
}

async function renderPdf(html) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 20000 });
    return await page.pdf({
      printBackground: true,
      landscape: true,
      format: "A4",
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: 10000,
    });
  } finally {
    if (browser) { try { await browser.close(); } catch (e) { /* noop */ } }
  }
}

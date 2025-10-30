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

  // 1) data for the template
  const certificateNumber = generateCertificateNumber("WISE");
  const verifyUrl = `${process.env.VERIFY_BASE_URL}?code=${encodeURIComponent(certificateNumber)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 6 });

  // 2) inline background to avoid file:// issues
  const bgPath = path.resolve(process.cwd(), "src/lib/assets/certificate-bg.png");
  let bgDataUrl = "";
  try {
    const buf = await fs.readFile(bgPath);
    bgDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  } catch (e) {
    console.warn("[cert] background not found:", bgPath, e?.message);
  }

  // 3) build HTML (only name, course, date, code, qr)
  const html = buildCertificateHTML({
    studentName: completion.user.fullName || completion.user.emailAddress,
    courseTitle: completion.course.title,
    certificateNumber,
    qrDataUrl,
    bgDataUrl,
  });

  // 4) render PDF (A4 landscape, no margins)
  const pdfBuffer = await renderPdf(html);

  // 5) upload to your existing Supabase provider (via adapter)
  const publicId = `${completion.courseId}-${certificateNumber}`;
  const { directUrl } = await uploadBufferToSupabase(pdfBuffer, publicId);

  // 6) persist
  return prisma.certificate.create({
    data: {
      certificateNumber,
      certificateUrl: directUrl,
      userId: completion.userId,
      courseId: completion.courseId,
      completionId: completion.id,
    },
  });
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

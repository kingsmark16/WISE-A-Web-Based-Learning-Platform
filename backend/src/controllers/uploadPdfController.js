import path from "path";
import { storage } from "../storage/index.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const EXPIRES_SEC = 60 * 60 * 4; // 4 hours

const safeBase = (name) =>
  (path.parse(name).name || "document").replace(/[^\w\-]+/g, "_");

// Minimal PDF signature check: file starts with "%PDF-"
function isPdfMagicBuffer(buffer) {
  return buffer.slice(0, 5).toString() === "%PDF-";
}

// POST /upload-pdf
export const uploadPdf = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No PDF uploaded" });

    // Get moduleId, title, description from body (for all files)
    const { moduleId, title, description } = req.body;

    if(!moduleId) return res.status(400).json({message: 'moduleId is undefined'})

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            createdById: true,
            facultyId: true
          }
        }
      }
    });
    if (!module) return res.status(400).json({ message: "moduleId is required" });

    // Find next position in module
    const last = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: "desc" }
    });
    let position = last ? last.position + 1 : 1;

    const results = [];

    for (const file of req.files) {
      // Check PDF magic number in buffer
      if (!isPdfMagicBuffer(file.buffer)) {
        results.push({ error: "Invalid PDF file.", originalname: file.originalname });
        continue;
      }

      const base = safeBase(file.originalname);
      const filename = `${base}.pdf`;
      const key = `pdfs/${filename}`;

      await storage.uploadPdf({ key, buffer: file.buffer });

      // Short-lived direct links
      const { url: view_url } = await storage.getViewUrl({ key, seconds: EXPIRES_SEC });
      const { url: direct_download_url } = await storage.getDownloadUrl({
        key, filename, seconds: EXPIRES_SEC
      });

      // Stable API endpoints
      const preview_api_url  = `${API_BASE}/api/upload-pdf/preview?id=${encodeURIComponent(key)}`;
      const download_api_url = `${API_BASE}/api/upload-pdf/download?id=${encodeURIComponent(key)}&name=${encodeURIComponent(filename)}`;

      // Save as lesson in DB
      const lesson = await prisma.lesson.create({
        data: {
          moduleId,
          title: title || base,
          description: description || "",
          type: "PDF",
          url: preview_api_url, // or direct_download_url if you prefer
          position,
        }
      });

      results.push({
        message: "PDF uploaded",
        key,
        filename,
        view_url,
        direct_download_url,
        preview_api_url,
        download_api_url,
        originalname: file.originalname,
        lesson, // include lesson info
      });

      position++; // increment for next file
    }

    return res.json({ results });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
};

// GET /upload-pdf/preview?id=<key>
export const previewPdf = async (req, res) => {
  try {
    const key = req.query.id;
    if (!key) return res.status(400).json({ error: "Missing id" });
    const { url } = await storage.getViewUrl({ key, seconds: EXPIRES_SEC });
    return res.redirect(302, url); // inline preview
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
};

// GET /upload-pdf/download?id=<key>&name=<filename.pdf>
// export const downloadPdf = async (req, res) => {
//   try {
//     const key = req.query.id;
//     const name = (req.query.name || "document.pdf").replace(/[^\w\-.]+/g, "_");
//     if (!key) return res.status(400).json({ error: "Missing id" });

//     const { url } = await storage.getDownloadUrl({
//       key,
//       filename: name,
//       seconds: EXPIRES_SEC,
//     });
//     return res.redirect(302, url); // forces browser download with proper filename
//   } catch (e) {
//     return res.status(500).json({ error: e.message || String(e) });
//   }
// };

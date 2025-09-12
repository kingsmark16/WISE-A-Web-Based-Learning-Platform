import fs from "fs";
import path from "path";
import { storage } from "../storage/index.js";

const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const EXPIRES_SEC = 60 * 60 * 4; // 4 hours

const safeBase = (name) =>
  (path.parse(name).name || "document").replace(/[^\w\-]+/g, "_");

// Minimal PDF signature check: file starts with "%PDF-"
function isPdfMagic(filePath) {
  try {
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(5);
    fs.readSync(fd, buf, 0, 5, 0);
    fs.closeSync(fd);
    return buf.toString() === "%PDF-";
  } catch {
    return false;
  }
}

// POST /upload-pdf  (multer puts temp file at req.file.path)
export const uploadPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No PDF uploaded" });

    // Optional hardening
    if (!isPdfMagic(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({ message: "Invalid PDF file." });
    }

    const base = safeBase(req.file.originalname);
    const filename = `${Date.now()}-${base}.pdf`;
    const key = `pdfs/${filename}`;

    const buffer = fs.readFileSync(req.file.path);
    await storage.uploadPdf({ key, buffer });

    // cleanup temp file
    try { fs.unlinkSync(req.file.path); } catch {}

    // Short-lived direct links (good for immediate use)
    const { url: view_url } = await storage.getViewUrl({ key, seconds: EXPIRES_SEC });
    const { url: direct_download_url } = await storage.getDownloadUrl({
      key, filename, seconds: EXPIRES_SEC
    });

    // Stable API endpoints (recommended in your app/UI)
    const preview_api_url  = `${API_BASE}/upload-pdf/preview?id=${encodeURIComponent(key)}`;
    const download_api_url = `${API_BASE}/upload-pdf/download?id=${encodeURIComponent(key)}&name=${encodeURIComponent(filename)}`;

    return res.json({
      message: "PDF uploaded",
      key,
      filename,
      // short-lived direct links:
      view_url,
      direct_download_url,
      // stable backend links (mint fresh signed URLs on demand):
      preview_api_url,
      download_api_url,
    });
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
export const downloadPdf = async (req, res) => {
  try {
    const key = req.query.id;
    const name = (req.query.name || "document.pdf").replace(/[^\w\-.]+/g, "_");
    if (!key) return res.status(400).json({ error: "Missing id" });

    const { url } = await storage.getDownloadUrl({
      key,
      filename: name,
      seconds: EXPIRES_SEC,
    });
    return res.redirect(302, url); // forces browser download with proper filename
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
};

import express from "express";
import multer from "multer";
import { uploadPdf, previewPdf } from "../controllers/uploadPdfController.js";

const router = express.Router();

// Temp storage; we upload to Supabase then delete
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB = Supabase Free limit
  fileFilter: (_req, file, cb) =>
    file.mimetype === "application/pdf" ? cb(null, true) : cb(new Error("Only PDFs"), false),
});

// POST /upload-pdf
router.post("/", upload.array("pdf", 10), uploadPdf);

// GET /upload-pdf/preview?id=<key>
router.get("/preview", previewPdf);

// GET /upload-pdf/download?id=<key>&name=<filename.pdf>
// router.get("/download", downloadPdf);

export default router;

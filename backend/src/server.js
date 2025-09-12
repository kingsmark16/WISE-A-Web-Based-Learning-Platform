// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";

import { clerkMiddleware, requireAuth } from "@clerk/express";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import uploadPdfRoutes from "./routes/uploadPdfRoutes.js";
import { updateLastActive } from "./middlewares/updateLastActiveMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads dir exists (backend/uploads/pdfs)
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "pdfs");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Core middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.254.180:5173",
    ],
    credentials: true,
  })
);

// Clerk (note: this does NOT force auth by itself)
app.use(clerkMiddleware());

// Static files for inline PDF viewing
// e.g. http://localhost:3000/files/<filename>.pdf
app.use("/files", express.static(UPLOADS_DIR));

// ===== Protected APIs =====
app.use("/api/upload", requireAuth(), uploadRoutes);
app.use("/api/admin", requireAuth(), updateLastActive, adminRoutes);
app.use("/api/student", requireAuth(), updateLastActive, studentRoutes);
app.use("/api/faculty", requireAuth(), updateLastActive, facultyRoutes);
app.use("/api/course", requireAuth(), courseRoutes);
app.use("/api/stats", requireAuth(), statsRoutes);
app.use("/api/auth", requireAuth(), updateLastActive, authRoutes);

// ===== Public APIs =====
app.use("/api", guestRoutes);

// PDF upload (currently public; add requireAuth() if you want to protect)
app.use("/upload-pdf", uploadPdfRoutes);

// Health + debug
app.post("/debug", (req, res) => res.send("Debug POST hit!"));
app.get("/", (req, res) => res.send("Server is running"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in PORT ${PORT}`);
});

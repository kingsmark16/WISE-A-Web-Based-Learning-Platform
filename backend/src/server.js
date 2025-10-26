import "./env.js";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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
import forumNotificationRoutes from "./routes/forumNotificationRoutes.js";
import dropboxUploadRoutes from "./routes/dropboxUploadRoutes.js";
import dropboxAuthRoutes from './routes/dropboxAuthRoutes.js'
import { updateLastActive } from './middlewares/updateLastActiveMiddleware.js';
import youtubeAuthRoutes from "./routes/youtubeAuthRoutes.js";
import youtubeVideoRoutes from "./routes/youtubeVideoRoutes.js";
import linkRoutes from "./routes/linkRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import { arcjetRateLimit, strictRateLimit } from "./middlewares/arcjetRateLimit.js"; 
import certificatesRoutes from "./routes/certificatesRoutes.js";
import completionsRoutes from "./routes/completionsRoutes.js";
 
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.254.180:5173"],
    credentials: true,
  }
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "pdfs");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", true);

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.254.180:5173"],
    credentials: true,
  })
);

// Clerk
app.use(clerkMiddleware());

// GLOBAL rate limiter (applies to all routes below) can be edited through .env file
//app.use(arcjetRateLimit);

// Static files
app.use("/files", express.static(UPLOADS_DIR));

app.use('/api/upload', requireAuth(), updateLastActive, uploadRoutes);
app.use('/api/admin',   requireAuth(), updateLastActive, adminRoutes);
app.use('/api/student', requireAuth(), updateLastActive, studentRoutes);
app.use('/api/faculty', requireAuth(), updateLastActive, facultyRoutes);
app.use('/api/course', requireAuth(), updateLastActive, courseRoutes);
app.use('/api/stats',  requireAuth(), updateLastActive, statsRoutes);
app.use('/api/auth', requireAuth(), updateLastActive, authRoutes);

app.use('/api/forumNotif', requireAuth(), forumNotificationRoutes);



app.use('/api/youtube-lessons', youtubeVideoRoutes);
app.use('/api/upload-dropbox', dropboxUploadRoutes);
app.use('/api/upload-pdf', uploadPdfRoutes);
app.use('/api/link', linkRoutes);

app.use('/api/youtube-auth', requireAuth(), youtubeAuthRoutes);
app.use('/api/dropbox-auth', dropboxAuthRoutes);

app.use('/api/certificate', certificatesRoutes);
app.use('/api/completions', completionsRoutes);
app.use('/api/quiz', quizRoutes);

// ===== Public APIs =====
app.use('/api', strictRateLimit("5m", 10), guestRoutes);


// Health / debug
app.post("/api/_ping", (req, res) => res.json({ ok: true }));
app.get("/", (req, res) => res.send("Server is running"));

//testing endpoint: 
app.get("/healthz", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

console.log("ARCJET envs:", {
  MODE: process.env.ARCJET_MODE,
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join a specific post room
  socket.on('join-post', (postId) => {
    socket.join(`post-${postId}`);
    console.log(`Socket ${socket.id} joined post-${postId}`);
  });
  
  // Leave a post room
  socket.on('leave-post', (postId) => {
    socket.leave(`post-${postId}`);
    console.log(`Socket ${socket.id} left post-${postId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

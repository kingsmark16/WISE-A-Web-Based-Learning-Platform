import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { clerkMiddleware, requireAuth } from '@clerk/express';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import uploadPdfRoutes from './routes/uploadPdfRoutes.js';
import forumNotificationRoutes from './routes/forumNotificationRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import lessonsRoutes from './routes/lessonRoutes.js';
import dropboxUploadRoutes from './routes/dropboxUploadRoutes.js';
import dropboxAuthRoutes from './routes/dropboxAuthRoutes.js'
import { updateLastActive } from './middlewares/updateLastActiveMiddleware.js';
import youtubeAuthRoutes from './routes/youtubeAuthRoutes.js';
import youtubeVideoRoutes from './routes/youtubeVideoRoutes.js';


const app = express();
const PORT = process.env.PORT || 3000;

// Resolve project root (for static paths when running with ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads dir exists (backend/uploads/pdfs)
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'pdfs');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Core middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://192.168.254.180:5173',
    ],
    credentials: true,
  })
);

// Clerk middleware
app.use(clerkMiddleware());

// Static files 
app.use('/files', express.static(UPLOADS_DIR));

app.use('/api/upload', requireAuth(), uploadRoutes);
app.use('/api/admin',   requireAuth(), updateLastActive, adminRoutes);
app.use('/api/student', requireAuth(), updateLastActive, studentRoutes);
app.use('/api/faculty', requireAuth(), updateLastActive, facultyRoutes);
app.use('/api/course', requireAuth(), courseRoutes);
app.use('/api/stats',  requireAuth(), statsRoutes);
app.use('/api/auth', requireAuth(), updateLastActive, authRoutes);

app.use('/api/forumNotif', requireAuth(), forumNotificationRoutes);
app.use('/api/forum', requireAuth(), updateLastActive, forumRoutes);


app.use('/api/module', requireAuth(), moduleRoutes)



app.use('/api/youtube-lessons', youtubeVideoRoutes);
app.use('/api/upload-dropbox', dropboxUploadRoutes);
app.use('/api/upload-pdf', uploadPdfRoutes);
app.use('/api/lessons', lessonsRoutes);

app.use('/api/youtube-auth', requireAuth(), youtubeAuthRoutes);
app.use('/api/dropbox-auth', dropboxAuthRoutes);

// ===== Public APIs =====
app.use('/api', guestRoutes);


// Health / debug
app.post('/api/_ping', (req, res) => res.json({ ok: true }));
app.get('/',          (req, res) => res.send('Server is running'));
app.get('/healthz',   (req, res) => res.json({ ok: true }));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

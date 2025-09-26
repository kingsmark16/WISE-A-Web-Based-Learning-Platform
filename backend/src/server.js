// src/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import { clerkMiddleware, requireAuth } from '@clerk/express';

// your existing routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import uploadPdfRoutes from './routes/uploadPdfRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import dropboxUploadRoutes from './routes/dropboxUploadRoutes.js';
import dropboxAuthRoutes from './routes/dropboxAuthRoutes.js'
import { updateLastActive } from './middlewares/updateLastActiveMiddleware.js';

// YouTube routes (from our implementation)
import youtubeAuthRoutes from './routes/youtubeAuthRoutes.js';
import youtubeVideoRoutes from './routes/youtubeVideoRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

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

// Clerk middleware (parses cookies/headers, attaches req.auth)
// NOTE: We do NOT use ClerkExpressWithAuth here.
app.use(clerkMiddleware());

// Static files for inline PDF viewing
app.use('/files', express.static(UPLOADS_DIR));

// ===== Protected APIs (your existing ones) =====
app.use('/api/upload', requireAuth(), uploadRoutes);
app.use('/api/admin', requireAuth(), updateLastActive, adminRoutes);
app.use('/api/student', requireAuth(), updateLastActive, studentRoutes);
app.use('/api/faculty', requireAuth(), updateLastActive, facultyRoutes);
app.use('/api/course', requireAuth(), courseRoutes);
app.use('/api/stats', requireAuth(), statsRoutes);
app.use('/api/auth', requireAuth(), updateLastActive, authRoutes);
app.use('/api/module', requireAuth(), moduleRoutes)

// ===== YouTube APIs (mounted as-is; they self-protect inside) =====
app.use('/api/youtube-auth', requireAuth(), youtubeAuthRoutes);
app.use('/api/youtube-lessons', youtubeVideoRoutes);

app.use('/api/upload-dropbox', dropboxUploadRoutes);
app.use('/api/dropbox-auth', dropboxAuthRoutes);

// ===== Public APIs =====
app.use('/api', guestRoutes);

// PDF upload (public for now)
app.use('/api/upload-pdf', uploadPdfRoutes);

// Health + debug
app.post('/debug', (req, res) => res.send('Debug POST hit!'));
app.get('/', (req, res) => res.send('Server is running'));
app.get('/healthz', (req, res) => res.json({ ok: true }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in PORT ${PORT}`);
});

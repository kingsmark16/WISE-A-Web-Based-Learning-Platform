import { Router } from 'express';
import multer from 'multer'; // Add this import
import { requireRole } from '../middlewares/authMiddleware.js';
import { uploadVideo } from '../middlewares/uploadVideoMiddleware.js';
import {
  uploadToYouTube, 
  remove,
  updateLesson
} from '../controllers/youtubeVideoController.js';

const router = Router();

// Create multer instance for form data (no files)
const formData = multer();

// Create / register
router.post('/upload', uploadVideo.array('video', 10), uploadToYouTube);

// Update - handle multipart form data
router.patch('/:id', formData.none(), updateLesson);

// Delete
router.delete('/:id', remove);

export default router;

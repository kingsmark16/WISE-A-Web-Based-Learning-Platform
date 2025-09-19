import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { requireRole /* or requireRoles */ } from '../middlewares/authMiddleware.js'; // whichever file defines it
import { uploadVideo } from '../middlewares/uploadVideoMiddleware.js';
import {
  uploadToYouTube, registerExisting, getOne, listByModule, listByCourse,
  update, putUpdate, refresh, patchYouTubeMetadata, replaceVideo, bulkReorder, remove
} from '../controllers/youtubeVideoController.js';

const router = Router();

// At least ensure the user is signed in
router.use(requireAuth());

// Create / register
router.post('/upload',   requireRole(['FACULTY','ADMIN']), uploadVideo.single('video'), uploadToYouTube);
router.post('/register', requireRole(['FACULTY','ADMIN']), registerExisting);

// Read
router.get('/:id',              getOne);
router.get('/module/:moduleId', listByModule);
router.get('/course/:courseId', listByCourse);

// Update
router.patch('/:id',            requireRole(['FACULTY','ADMIN']), update);
router.put('/:id',              requireRole(['FACULTY','ADMIN']), putUpdate);

// YouTube metadata & advanced edits
router.patch('/:id/youtube',    requireRole(['FACULTY','ADMIN']), patchYouTubeMetadata);
router.patch('/:id/replace',    requireRole(['FACULTY','ADMIN']), replaceVideo);
router.patch('/reorder',        requireRole(['FACULTY','ADMIN']), bulkReorder);

// Refresh & Delete
router.post('/:id/refresh',     requireRole(['FACULTY','ADMIN']), refresh);
router.delete('/:id',           requireRole(['FACULTY','ADMIN']), remove);

export default router;

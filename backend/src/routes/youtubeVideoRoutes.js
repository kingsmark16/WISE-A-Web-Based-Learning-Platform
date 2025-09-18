import { Router } from 'express';
import {requireRole} from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { uploadVideo } from '../middlewares/uploadVideoMiddleware.js';

import {
  uploadToYouTube,
  registerExisting,
  getOne,
  listByModule,
  listByCourse,
  update,
  putUpdate,
  refresh,
  patchYouTubeMetadata,
  replaceVideo,
  bulkReorder,
  remove
} from '../controllers/youtubeVideoController.js';

const router = Router();

// Create / register
router.post('/upload',   requireRole('FACULTY','ADMIN'), uploadVideo.single('video'), uploadToYouTube);
router.post('/register', requireRole('FACULTY','ADMIN'), registerExisting);

// Read
router.get('/:id',              getOne);
router.get('/module/:moduleId', listByModule);
router.get('/course/:courseId', listByCourse);

// Update (partial & full)
router.patch('/:id',            requireRole('FACULTY','ADMIN'), update);
router.put('/:id',              requireRole('FACULTY','ADMIN'), putUpdate);

// YouTube-side changes & advanced edits
router.patch('/:id/youtube',    requireRole('FACULTY','ADMIN'), patchYouTubeMetadata);
router.patch('/:id/replace',    requireRole('FACULTY','ADMIN'), replaceVideo);
router.patch('/reorder',        requireRole('FACULTY','ADMIN'), bulkReorder);

// Refresh & Delete
router.post('/:id/refresh',     requireRole('FACULTY','ADMIN'), refresh);
router.delete('/:id',           requireRole('FACULTY','ADMIN'), remove);

export default router;

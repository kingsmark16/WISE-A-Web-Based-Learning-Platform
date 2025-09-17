import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
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
router.post('/upload',   authMiddleware, requireRoles('FACULTY','ADMIN'), uploadVideo.single('video'), uploadToYouTube);
router.post('/register', authMiddleware, requireRoles('FACULTY','ADMIN'), registerExisting);

// Read
router.get('/:id',              authMiddleware, getOne);
router.get('/module/:moduleId', authMiddleware, listByModule);
router.get('/course/:courseId', authMiddleware, listByCourse);

// Update (partial & full)
router.patch('/:id',            authMiddleware, requireRoles('FACULTY','ADMIN'), update);
router.put('/:id',              authMiddleware, requireRoles('FACULTY','ADMIN'), putUpdate);

// YouTube-side changes & advanced edits
router.patch('/:id/youtube',    authMiddleware, requireRoles('FACULTY','ADMIN'), patchYouTubeMetadata);
router.patch('/:id/replace',    authMiddleware, requireRoles('FACULTY','ADMIN'), replaceVideo);
router.patch('/reorder',        authMiddleware, requireRoles('FACULTY','ADMIN'), bulkReorder);

// Refresh & Delete
router.post('/:id/refresh',     authMiddleware, requireRoles('FACULTY','ADMIN'), refresh);
router.delete('/:id',           authMiddleware, requireRoles('FACULTY','ADMIN'), remove);

export default router;

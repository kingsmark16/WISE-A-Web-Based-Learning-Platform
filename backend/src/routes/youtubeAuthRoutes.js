import { Router } from 'express';
import { start, callback } from '../controllers/youtubeAuthController.js';
import { requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Only ADMIN should bind the channel once
router.get('/init', requireRole(['ADMIN']), start);
router.get('/callback', callback);

export default router;

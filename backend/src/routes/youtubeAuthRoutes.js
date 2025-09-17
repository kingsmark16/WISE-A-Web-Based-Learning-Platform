import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { start, callback } from '../controllers/youtubeAuthController.js';

const router = Router();

// Only ADMIN should bind the channel once
router.get('/init', authMiddleware, requireRoles('ADMIN'), start);
router.get('/callback', callback);

export default router;

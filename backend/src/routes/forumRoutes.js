// src/routes/forumRoutes.js
import { Router } from 'express';
import { requireRole } from '../middlewares/authMiddleware.js';
import { requireCourseMembership } from '../middlewares/requireCourseMembership.js';
import {
  listThreads,
  createThread,
  getThread,
  updateThread,
  deleteThread,
  setThreadFlag,
  createReply,
  updateReply,
  deleteReply
} from '../controllers/forumController.js';

const router = Router();
const ALL = ['ADMIN', 'FACULTY', 'STUDENT'];

// ---------- THREADS ----------
router.get(
  '/courses/:courseId/forum/threads',
  requireRole(ALL),
  requireCourseMembership(),
  listThreads
);

router.post(
  '/courses/:courseId/forum/threads',
  requireRole(ALL),
  requireCourseMembership(),
  createThread
);

router.get('/forum/posts/:postId', requireRole(ALL), getThread);

router.patch('/forum/posts/:postId', requireRole(ALL), updateThread);

router.delete('/forum/posts/:postId', requireRole(['ADMIN', 'FACULTY']), deleteThread);

// moderation (faculty/admin)
router.post('/forum/posts/:postId/pin',   requireRole(['ADMIN','FACULTY']), setThreadFlag('pin',  true));
router.post('/forum/posts/:postId/unpin', requireRole(['ADMIN','FACULTY']), setThreadFlag('pin',  false));
router.post('/forum/posts/:postId/lock',  requireRole(['ADMIN','FACULTY']), setThreadFlag('lock', true));
router.post('/forum/posts/:postId/unlock',requireRole(['ADMIN','FACULTY']), setThreadFlag('lock', false));

// ---------- REPLIES ----------
router.post('/forum/posts/:postId/replies', requireRole(ALL), createReply);
router.patch('/forum/replies/:replyId',     requireRole(ALL), updateReply);
router.delete('/forum/replies/:replyId',    requireRole(ALL), deleteReply);

export default router;

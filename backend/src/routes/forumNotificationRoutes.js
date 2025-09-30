import { Router } from 'express';
import { requireRole } from '../middlewares/authMiddleware.js'; // uses Clerk publicMetadata.role :contentReference[oaicite:5]{index=5}
import { requireCourseMembership } from '../middlewares/requireCourseMembership.js';
import {
  getCourseForumSummary,
  getThreadSummary,
  listChangedThreads,
  listNewReplies
} from '../controllers/forumNotificationsController.js';

const router = Router();
const ALLOW = ['ADMIN','FACULTY','STUDENT'];

router.get('/courses/:courseId/forum/summary',
  requireRole(ALLOW), requireCourseMembership(), getCourseForumSummary);

router.get('/courses/:courseId/forum/threads/changes',
  requireRole(ALLOW), requireCourseMembership(), listChangedThreads);

router.get('/forum/posts/:postId/summary',
  requireRole(ALLOW), getThreadSummary);

router.get('/forum/posts/:postId/replies/changes',
  requireRole(ALLOW), listNewReplies);

export default router;

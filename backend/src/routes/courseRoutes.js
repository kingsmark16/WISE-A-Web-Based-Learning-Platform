import { Router } from "express";
import { createCourse, deleteCourse, getCourse, getCourses, publishCourse, updateCourse } from "../controllers/courseController.js";
import { requireRole } from "../middlewares/authMiddleware.js";
import { createModule, deleteModule, getModule, getModules, reorderModules, updateModule } from "../controllers/moduleControllers.js";
import { reorderLessons } from "../controllers/lessonsController.js";
import { requireCourseMembership } from '../middlewares/requireCourseMembership.js';
import {
  createReply,
  updateReply,
  deleteReply,
  listOfPost,
  getPost,
  updatePost,
  createPost,
  deletePost,
  setPostFlag,
  toggleLikePost,
  getForumCategories
} from '../controllers/forumController.js';

const router = Router();

const ALL = ['ADMIN', 'FACULTY', 'STUDENT'];

// ---------- FORUM CATEGORIES ----------
// GET /api/course/:courseId/forum/categories
router.get('/:courseId/forum/categories', requireRole(ALL), getForumCategories);

// ---------- FORUM THREADS ----------
// GET /api/course/:courseId/forum/threads
router.get('/:courseId/forum/threads', requireRole(ALL), listOfPost);

// POST /api/course/:courseId/forum/threads
router.post('/:courseId/forum/threads', requireRole(ALL), requireCourseMembership(), createPost);

// GET /api/course/forum/posts/:postId
router.get('/forum/posts/:postId', requireRole(ALL), getPost);

// PATCH /api/course/forum/posts/:postId
router.patch('/forum/posts/:postId', requireRole(ALL), updatePost);

// DELETE /api/course/forum/posts/:postId
router.delete('/forum/posts/:postId', requireRole(['ADMIN', 'FACULTY']), deletePost);

// moderation (faculty/admin)
router.post('/forum/posts/:postId/pin',   requireRole(['ADMIN','FACULTY']), setPostFlag('pin',  true));
router.post('/forum/posts/:postId/unpin', requireRole(['ADMIN','FACULTY']), setPostFlag('pin',  false));
router.post('/forum/posts/:postId/lock',  requireRole(['ADMIN','FACULTY']), setPostFlag('lock', true));
router.post('/forum/posts/:postId/unlock',requireRole(['ADMIN','FACULTY']), setPostFlag('lock', false));

// POST /api/course/forum/posts/:postId/like - Toggle like on a post
router.post('/forum/posts/:postId/like', requireRole(ALL), toggleLikePost);

// ---------- FORUM REPLIES ----------
// POST /api/course/forum/posts/:postId/replies
router.post('/forum/posts/:postId/replies', requireRole(ALL), createReply);

// PATCH /api/course/forum/posts/:postId/replies/:replyId
router.patch('/forum/posts/:postId/replies/:replyId', requireRole(ALL), updateReply);

// DELETE /api/course/forum/posts/:postId/replies/:replyId
router.delete('/forum/posts/:postId/replies/:replyId', requireRole(ALL), deleteReply);

// Lesson reorder within a module
router.post("/modules/:id/lessons/reorder", reorderLessons);

// Module routes (register first so '/modules' doesn't match '/:id')
router.post('/modules/', createModule);
router.get('/module/:id', getModule);
router.get('/modules/', getModules);
router.patch('/modules/reorder', reorderModules);
router.patch('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

//Course routes
router.post('/', requireRole(['ADMIN', 'FACULTY']), createCourse);
router.get('/:id', getCourse);
router.get('/',requireRole(['ADMIN']), getCourses);
router.patch('/:id', requireRole(['ADMIN', 'FACULTY']), updateCourse);
router.delete('/:id', requireRole(['ADMIN']), deleteCourse);
router.patch('/:id/publish', requireRole(['ADMIN', 'FACULTY']), publishCourse);

export default router;
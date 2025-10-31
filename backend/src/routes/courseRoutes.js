import { Router } from "express";
import { createCourse, archiveCourse, getCourse, getCourses, publishCourse, updateCourse } from "../controllers/courseController.js";
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
router.get('/:courseId/forum/categories', requireRole(ALL), requireCourseMembership(), getForumCategories);

// ---------- FORUM THREADS ----------
// GET /api/course/:courseId/forum/threads
router.get('/:courseId/forum/threads', requireRole(ALL), requireCourseMembership(), listOfPost);

// POST /api/course/:courseId/forum/threads
router.post('/:courseId/forum/threads', requireRole(ALL), requireCourseMembership(), createPost);

// GET /api/course/forum/posts/:postId
router.get('/forum/posts/:postId', requireRole(ALL), requireCourseMembership(), getPost);

// PATCH /api/course/forum/posts/:postId
router.patch('/forum/posts/:postId', requireRole(ALL), requireCourseMembership(), updatePost);

// DELETE /api/course/forum/posts/:postId
router.delete('/forum/posts/:postId', requireRole(ALL), requireCourseMembership(), deletePost);

// moderation (all roles for pin, all roles for lock)
router.post('/forum/posts/:postId/pin',   requireRole(ALL), requireCourseMembership(), setPostFlag('pin',  true));
router.post('/forum/posts/:postId/unpin', requireRole(ALL), requireCourseMembership(), setPostFlag('pin',  false));
router.post('/forum/posts/:postId/lock',  requireRole(ALL), requireCourseMembership(), setPostFlag('lock', true));
router.post('/forum/posts/:postId/unlock',requireRole(ALL), requireCourseMembership(), setPostFlag('lock', false));

// POST /api/course/forum/posts/:postId/like - Toggle like on a post
router.post('/forum/posts/:postId/like', requireRole(ALL), requireCourseMembership(), toggleLikePost);

// ---------- FORUM REPLIES ----------
// POST /api/course/forum/posts/:postId/replies
router.post('/forum/posts/:postId/replies', requireRole(ALL), requireCourseMembership(), createReply);

// PATCH /api/course/forum/posts/:postId/replies/:replyId
router.patch('/forum/posts/:postId/replies/:replyId', requireRole(ALL), requireCourseMembership(), updateReply);

// DELETE /api/course/forum/posts/:postId/replies/:replyId
router.delete('/forum/posts/:postId/replies/:replyId', requireRole(ALL), requireCourseMembership(), deleteReply);

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
router.patch('/:id/archive', requireRole(['ADMIN']), archiveCourse);
router.patch('/:id/publish', requireRole(['ADMIN', 'FACULTY']), publishCourse);

export default router;
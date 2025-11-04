import { Router } from 'express';
import { requireRole } from '../middlewares/authMiddleware.js';
import {
  getFacultyStats,
  getFacultyCourses,
  getTotalEnrolled,
  getCourseAnalytics,
  getTopCoursesByEngagement
} from '../controllers/facultyController.js';

const router = Router();

// All endpoints restricted to FACULTY and ADMIN roles
const allowFacultyOrAdmin = requireRole(['FACULTY', 'ADMIN']);

// Optimized: Single endpoint for all stats
router.get('/:facultyId/stats', allowFacultyOrAdmin, getFacultyStats);

// Faculty courses with metadata
router.get('/:facultyId/courses', allowFacultyOrAdmin, getFacultyCourses);

// Total enrollment for a course or all courses (must be before /:courseId routes)
router.get('/:facultyId/courses/total-enrolled', allowFacultyOrAdmin, getTotalEnrolled);

// Individual course analytics (must be after total-enrolled)
router.get('/:facultyId/courses/:courseId/analytics', allowFacultyOrAdmin, getCourseAnalytics);

// Top courses by engagement
router.get('/:facultyId/top-courses', allowFacultyOrAdmin, getTopCoursesByEngagement);

export default router;

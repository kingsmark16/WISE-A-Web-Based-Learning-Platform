import { Router } from 'express';
import { requireRole } from '../middlewares/authMiddleware.js';
import {
  getFacultyStats,
  getFacultyCourses,
  getDraftCourses,
  getTotalEnrolled,
  getCourseAnalytics,
  getTopCoursesByEngagement,
  getFacultyCourseStudents,
  getStudentQuizAttempts,
  searchFacultyCourses
} from '../controllers/facultyController.js';

const router = Router();

// All endpoints restricted to FACULTY and ADMIN roles
const allowFacultyOrAdmin = requireRole(['FACULTY', 'ADMIN']);

// Specific routes FIRST (without facultyId prefix)
// Search faculty's own courses - must be BEFORE any /:facultyId routes
router.get('/search', allowFacultyOrAdmin, searchFacultyCourses);

// Draft courses - must be BEFORE /:facultyId/courses to match correctly
router.get('/draft-courses', allowFacultyOrAdmin, getDraftCourses);

// Get authenticated faculty's own courses - must be BEFORE /:facultyId/courses
router.get('/courses', allowFacultyOrAdmin, getFacultyCourses);

// Get enrolled students in a specific course (any authenticated user, authorization checked in controller)
// MUST be BEFORE /:facultyId/courses/:courseId/* routes
router.get('/courses/:courseId/students', getFacultyCourseStudents);

// Get student quiz attempts for a course
router.get('/courses/:courseId/students/:studentId/quiz-attempts', getStudentQuizAttempts);

// Optimized: Single endpoint for all stats
router.get('/:facultyId/stats', allowFacultyOrAdmin, getFacultyStats);

// Faculty courses with metadata (by facultyId parameter)
router.get('/:facultyId/courses', allowFacultyOrAdmin, getFacultyCourses);

// Total enrollment for a course or all courses (must be before /:courseId routes)
router.get('/:facultyId/courses/total-enrolled', allowFacultyOrAdmin, getTotalEnrolled);

// Individual course analytics (must be after total-enrolled)
router.get('/:facultyId/courses/:courseId/analytics', allowFacultyOrAdmin, getCourseAnalytics);

// Top courses by engagement
router.get('/:facultyId/top-courses', allowFacultyOrAdmin, getTopCoursesByEngagement);

export default router;

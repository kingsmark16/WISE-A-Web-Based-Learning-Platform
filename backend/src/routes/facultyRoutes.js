import { Router } from 'express';
import { requireRole } from '../middlewares/authMiddleware.js';
import {
  getFacultyCourses,
  getTotalCourses,
  getTotalPublishedCourses,
  getTotalDraftCourses,
  getTotalEnrolled
} from '../controllers/facultyController.js';

const router = Router();

// All endpoints restricted to FACULTY and ADMIN roles
const allowFacultyOrAdmin = requireRole(['FACULTY', 'ADMIN']);
router.get('/:facultyId/courses', allowFacultyOrAdmin, getFacultyCourses);
router.get('/:facultyId/courses/total', allowFacultyOrAdmin, getTotalCourses);
router.get('/:facultyId/courses/total-published', allowFacultyOrAdmin, getTotalPublishedCourses);
router.get('/:facultyId/courses/total-draft', allowFacultyOrAdmin, getTotalDraftCourses);
router.get('/:facultyId/courses/total-enrolled', allowFacultyOrAdmin, getTotalEnrolled);

export default router;

import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { checkEnrollmentStatus, enrollInCourse, getCourseCategories, getCourseModules, getFeaturedCourses, getSelectedCourse, unenrollInCourse, markLessonComplete, getStudentCourseProgress, getStudentLessonProgress } from "../controllers/studentController.js";

const router = Router();

router.get('/categories', requireRole(['STUDENT']), getCourseCategories);
router.get('/selected-course/:id', requireRole(['STUDENT']), getSelectedCourse);
router.get('/featured-courses', requireRole(['STUDENT']), getFeaturedCourses);
router.get('/modules/:courseId', requireRole(['STUDENT']), getCourseModules);

// Progress tracking routes
router.post('/lesson-complete', requireRole(['STUDENT']), markLessonComplete);
router.get('/course-progress/:courseId', requireRole(['STUDENT']), getStudentCourseProgress);
router.get('/lesson-progress/:courseId', requireRole(['STUDENT']), getStudentLessonProgress);

router.post('/enroll', requireRole(['STUDENT']), enrollInCourse);
router.post('/unenroll', requireRole(['STUDENT']), unenrollInCourse);
router.get('/enrollment-status/:courseId', requireRole(['STUDENT']), checkEnrollmentStatus);


export default router;
import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { checkEnrollmentStatus, enrollInCourse, getCourseCategories, getCourseModules, getModuleDetailsForStudent, getFeaturedCourses, getSelectedCourse, unenrollInCourse, markLessonComplete, getStudentCourseProgress, getStudentLessonProgress, startStudentQuiz, submitStudentQuiz, getStudentQuizSubmissions, trackLessonAccess, getStudentModuleProgress, getStudentProgressSummary, getEnrolledCourses, getCourseCompletion } from "../controllers/studentController.js";

const router = Router();

router.get('/categories', requireRole(['STUDENT']), getCourseCategories);
router.get('/selected-course/:id', requireRole(['STUDENT']), getSelectedCourse);
router.get('/featured-courses', requireRole(['STUDENT']), getFeaturedCourses);
router.get('/enrolled-courses', requireRole(['STUDENT']), getEnrolledCourses);
router.get('/modules/:courseId', requireRole(['STUDENT']), getCourseModules);
router.get('/module-details/:courseId/:moduleId', requireRole(['STUDENT']), getModuleDetailsForStudent);

// Progress tracking routes
router.post('/lesson-complete', requireRole(['STUDENT']), markLessonComplete);
router.post('/lesson-access', requireRole(['STUDENT']), trackLessonAccess);
router.get('/course-progress/:courseId', requireRole(['STUDENT']), getStudentCourseProgress);
router.get('/module-progress/:moduleId', requireRole(['STUDENT']), getStudentModuleProgress);
router.get('/lesson-progress/:courseId', requireRole(['STUDENT']), getStudentLessonProgress);
router.get('/progress-summary', requireRole(['STUDENT']), getStudentProgressSummary);

router.post('/enroll', requireRole(['STUDENT']), enrollInCourse);
router.post('/unenroll', requireRole(['STUDENT']), unenrollInCourse);
router.get('/enrollment-status/:courseId', requireRole(['STUDENT']), checkEnrollmentStatus);

// Course completion and certification
router.get('/course-completion/:courseId', requireRole(['STUDENT']), getCourseCompletion);

// Quiz routes
router.post('/quiz/start/:courseId/:moduleId', requireRole(['STUDENT']), startStudentQuiz);
router.post('/quiz/submit/:courseId/:moduleId', requireRole(['STUDENT']), submitStudentQuiz);
router.get('/quiz/submissions/:quizId', requireRole(['STUDENT']), getStudentQuizSubmissions);


export default router;
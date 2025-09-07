import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { checkEnrollmentStatus, enrollInCourse, getCourseCategories, getFeaturedCourses, getSelectedCourse } from "../controllers/studentController.js";

const router = Router();

router.get('/categories', requireRole(['STUDENT']), getCourseCategories);
router.get('/selected-course/:id', requireRole(['STUDENT']), getSelectedCourse);
router.get('/featured-courses', requireRole(['STUDENT']), getFeaturedCourses);

router.post('/enroll', requireRole(['STUDENT']), enrollInCourse);
router.get('/enrollment-status/:courseId', requireRole(['STUDENT']), checkEnrollmentStatus);


export default router;
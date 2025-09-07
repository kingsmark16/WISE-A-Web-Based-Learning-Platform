import { Router } from "express";

import { createCourse, deleteCourse, getCourse, getCourses, publishCourse, updateCourse } from "../controllers/courseController.js";
import { requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

router.post('/', requireRole(['ADMIN', 'FACULTY']), createCourse);
router.get('/:id', getCourse)
router.get('/', getCourses);
router.patch('/:id', requireRole(['ADMIN', 'FACULTY']), updateCourse);
router.delete('/:id', requireRole(['ADMIN']), deleteCourse);
router.patch('/:id/publish', requireRole(['ADMIN']), publishCourse);


export default router;
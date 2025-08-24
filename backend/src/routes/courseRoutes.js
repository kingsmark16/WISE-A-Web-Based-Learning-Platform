import { Router } from "express";

import { createCourse, deleteCourse, getCourse, getCourses, updateCourse } from "../controllers/courseController.js";
import { requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

router.post('/', createCourse);
router.get('/:id', getCourse)
router.get('/', getCourses);
router.patch('/:id', updateCourse);
router.delete('/:id', deleteCourse);



export default router;
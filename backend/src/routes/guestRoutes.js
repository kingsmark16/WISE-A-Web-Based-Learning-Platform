import { Router } from "express";

import { getRandomCoursesByCategories, getSingleCourse } from "../controllers/guestController.js";

const router = Router();

router.get('/', getRandomCoursesByCategories);
router.get('/:id', getSingleCourse);

export default router;
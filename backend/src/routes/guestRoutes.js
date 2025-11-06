import { Router } from "express";

import { getRandomCoursesByCategories, getSingleCourse, getRandomPublishedCourses } from "../controllers/guestController.js";

const router = Router();

router.get('/', getRandomCoursesByCategories);
router.get('/courses/random', getRandomPublishedCourses);
router.get('/:id', getSingleCourse);

export default router;
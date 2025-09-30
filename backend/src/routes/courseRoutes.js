import { Router } from "express";

import { createCourse, deleteCourse, getCourse, getCourses, publishCourse, updateCourse } from "../controllers/courseController.js";
import { requireRole } from "../middlewares/authMiddleware.js";
import { createModule, deleteModule, getModule, getModules, reorderModules, updateModule } from "../controllers/moduleControllers.js";
import { reorderLessons } from "../controllers/lessonsController.js";

const router = Router();

// Lesson reorder within a module
router.post("/modules/:id/lessons/reorder", reorderLessons);


// Module routes (register first so '/modules' doesn't match '/:id')
router.post('/modules/', createModule);
router.get('/module/:id', getModule);
router.get('/modules/', getModules);
router.patch('/modules/reorder', reorderModules);
router.patch('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

//Course routes
router.post('/', requireRole(['ADMIN', 'FACULTY']), createCourse);
router.get('/:id', getCourse);
router.get('/', getCourses);
router.patch('/:id', requireRole(['ADMIN', 'FACULTY']), updateCourse);
router.delete('/:id', requireRole(['ADMIN']), deleteCourse);
router.patch('/:id/publish', requireRole(['ADMIN', 'FACULTY']), publishCourse);


export default router;
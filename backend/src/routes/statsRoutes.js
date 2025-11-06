import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { 
    getActiveUsers, 
    getTotalCoursesAndUsers, 
    getTotalModules, 
    getTotalLessons, 
    getTopFacultyByCoursesCreated, 
    getTopStudentsByFinished
} from "../controllers/statsController.js";
import { getTopCoursesByEnrollments } from "../controllers/adminController.js";

const router = Router();

router.get('/total', getTotalCoursesAndUsers);
router.get('/active-users', getActiveUsers);

//bago ni mark
router.get('/modules/total', getTotalModules);
router.get('/lessons/total', getTotalLessons);
router.get('/students/top-finished', getTopStudentsByFinished);
router.get('/faculty/top-created', getTopFacultyByCoursesCreated);
router.get('/top-courses', getTopCoursesByEnrollments);

export default router;
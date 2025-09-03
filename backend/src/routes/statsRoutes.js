import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { getActiveUsers, getTotalCourses } from "../controllers/statsController.js";

const router = Router();

router.get('/total', getTotalCourses);
router.get('/active-users', getActiveUsers);


export default router;
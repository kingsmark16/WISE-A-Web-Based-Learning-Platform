import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { getActiveUsers, getTotalCoursesAndUsers } from "../controllers/statsController.js";

const router = Router();

router.get('/total', getTotalCoursesAndUsers);
router.get('/active-users', getActiveUsers);


export default router;
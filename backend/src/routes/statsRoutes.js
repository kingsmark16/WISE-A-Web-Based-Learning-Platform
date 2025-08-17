import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { getTotalCourses } from "../controllers/statsController.js";

const router = Router();

router.get('/total', getTotalCourses); 


export default router;
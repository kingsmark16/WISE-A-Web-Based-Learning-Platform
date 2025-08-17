import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { getStudentInfo } from "../controllers/studentController.js";

const router = Router();

router.get('/dashboard', requireRole(['STUDENT']), getStudentInfo)


export default router;
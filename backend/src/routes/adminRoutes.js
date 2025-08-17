import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { getAdminInfo } from "../controllers/adminController.js";

const router = Router();

router.get('/dashboard', requireRole(['ADMIN']), getAdminInfo);

export default router;
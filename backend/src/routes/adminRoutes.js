import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { getAdminInfo, getAllFaculty, getAllFacultyByName, getSingleFaculty } from "../controllers/adminController.js";

const router = Router();

router.get('/dashboard', requireRole(['ADMIN']), getAdminInfo);
router.get('/facname', requireRole(['ADMIN']), getAllFacultyByName);
router.get('/display-faculty', requireRole(['ADMIN']), getAllFaculty);
router.get('/display-faculty/:id', requireRole(['ADMIN']), getSingleFaculty);
//router.get('/display-student', requireRole(['ADMIN']), getAllStudent);

export default router;
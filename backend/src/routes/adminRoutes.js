import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { 
    getAdminInfo, 
    getAllFaculty, 
    getAllFacultyByName, 
    getSingleFaculty,
    getStudents,
    getSingleStudent
} from "../controllers/adminController.js";

const router = Router();

router.get('/dashboard', requireRole(['ADMIN']), getAdminInfo);
router.get('/facname', requireRole(['ADMIN']), getAllFacultyByName);
router.get('/display-faculty', requireRole(['ADMIN']), getAllFaculty);
router.get('/display-faculty/:id', requireRole(['ADMIN']), getSingleFaculty);
router.get('/display-students', requireRole(['ADMIN']), getStudents);
router.get('/display-students/:id', requireRole(['ADMIN']), getSingleStudent);

export default router;
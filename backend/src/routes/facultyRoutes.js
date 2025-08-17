import { Router } from "express";
import { getAllFacultyByName } from "../controllers/facultyController.js";

const router = Router();

router.get('/', getAllFacultyByName);

export default router;
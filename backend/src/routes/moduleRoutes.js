import { Router } from "express";
import { createModule, deleteModule, getModule, getModules, updateModule } from "../controllers/moduleControllers.js";

const router = Router();

router.post('/', createModule);
router.get('/:id', getModule);
router.get('/', getModules);
router.patch('/:id', updateModule);
router.delete('/:id', deleteModule);

export default router;
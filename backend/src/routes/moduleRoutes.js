import { Router } from "express";
import { createModule, deleteModule, getModule, getModules, updateModule, reorderModules } from "../controllers/moduleControllers.js";

const router = Router();

router.post('/', createModule);
router.get('/:id', getModule);
router.get('/', getModules);
router.patch('/reorder', reorderModules); // new bulk reorder endpoint
router.patch('/:id', updateModule);
router.delete('/:id', deleteModule);

export default router;
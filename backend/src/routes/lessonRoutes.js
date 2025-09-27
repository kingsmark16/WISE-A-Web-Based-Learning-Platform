import express from "express";
import { reorderLessons } from "../controllers/lessonsController.js";

const router = express.Router();

// POST /api/lessons/reorder  -> reorder lessons within a module
router.post("/reorder", reorderLessons);

export default router;
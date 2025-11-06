import { Router } from "express";
import { authCallback, getCurrentUserProfile } from "../controllers/authController.js";

const router = Router();

router.post('/callback', authCallback);
router.get('/profile', getCurrentUserProfile);

export default router;
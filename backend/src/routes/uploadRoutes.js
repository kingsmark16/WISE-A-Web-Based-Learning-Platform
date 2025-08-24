import { Router } from "express";
import { upload } from "../middlewares/thumbnailUploadMiddleware.js";
import { uploadImage } from "../controllers/uploadController.js";

const router = Router();

router.post('/image', upload.single('image'), uploadImage);

export default router;
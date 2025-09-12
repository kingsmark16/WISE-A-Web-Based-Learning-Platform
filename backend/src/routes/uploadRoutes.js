import { Router } from "express";
import { upload } from "../middlewares/thumbnailUploadMiddleware.js";
import { uploadImage, deleteImage } from "../controllers/uploadController.js";

const router = Router();

router.post('/image', upload.single('image'), uploadImage);
router.delete('/image', deleteImage);

export default router;
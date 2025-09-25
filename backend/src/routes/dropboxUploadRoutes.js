import { Router } from 'express'
import uploadVideo from '../middlewares/uploadVideoMiddleware.js';
import { uploadDropboxVideo } from '../controllers/dropboxUploadController.js';

const router = Router();

router.post('/', uploadVideo.array('file', 10), uploadDropboxVideo);

export default router;
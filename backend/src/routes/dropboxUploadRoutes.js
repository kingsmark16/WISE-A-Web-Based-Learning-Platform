import { Router } from 'express'
import uploadVideo from '../middlewares/uploadVideoMiddleware.js';
import { uploadDropboxVideo, editDropboxLesson, deleteDropboxLesson } from '../controllers/dropboxUploadController.js';

const router = Router();

router.post('/', uploadVideo.array('file', 10), uploadDropboxVideo);

// edit title only - ensure multer parses form fields when client sends multipart/form-data
router.put('/:lessonId', uploadVideo.none(), editDropboxLesson);

// delete lesson
router.delete('/:lessonId', deleteDropboxLesson);

export default router;
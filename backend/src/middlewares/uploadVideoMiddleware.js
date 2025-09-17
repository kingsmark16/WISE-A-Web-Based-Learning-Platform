import multer from 'multer';
import { extname } from 'path';
import mime from 'mime-types';

const maxBytes = parseInt(process.env.MAX_VIDEO_SIZE_BYTES || '2147483648', 10);
const allowed = (process.env.ALLOWED_VIDEO_MIME || '')
  .split(',').map(s => s.trim()).filter(Boolean);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp'),
  filename: (req, file, cb) => {
    const ext = extname(file.originalname) || '.' + (mime.lookup(file.mimetype) || 'mp4').split('/').pop();
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!allowed.length || allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported video mime type'), false);
};

export const uploadVideo = multer({ storage, fileFilter, limits: { fileSize: maxBytes } });
export default uploadVideo;

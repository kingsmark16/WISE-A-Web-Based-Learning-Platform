import multer from 'multer';

const maxBytes = parseInt(process.env.MAX_VIDEO_SIZE_BYTES || '2147483648', 10);
const allowed = (process.env.ALLOWED_VIDEO_MIME || '')
  .split(',').map(s => s.trim()).filter(Boolean);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!allowed.length || allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported video mime type'), false);
};

export const uploadVideo = multer({ storage, fileFilter, limits: { fileSize: maxBytes, files: 10 } });
export default uploadVideo;

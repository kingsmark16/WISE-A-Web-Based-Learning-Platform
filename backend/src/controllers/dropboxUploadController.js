import fs from 'fs';
import os from 'os';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import ffmpeg from 'fluent-ffmpeg';
import { uploadToDropbox, getPermanentLink, getVideoDuration } from '../services/dropboxService.js';

const prisma = new PrismaClient();

export const uploadDropboxVideo = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No file uploaded' });

    const { moduleId, title, description, position } = req.body;
    if (!moduleId) return res.status(400).json({ error: 'moduleId is required' });

    const results = [];
    for (const file of req.files) {
      // Get duration
      const duration = await getVideoDuration(file.buffer);

      // Write buffer to temp file for ffmpeg
      const tempVideoPath = path.join(os.tmpdir(), `${Date.now()}_${file.originalname}`);
      fs.writeFileSync(tempVideoPath, file.buffer);

      // Generate thumbnail (first frame)
      const tempThumbPath = path.join(os.tmpdir(), `${Date.now()}_thumb.png`);
      await new Promise((resolve, reject) => {
        ffmpeg(tempVideoPath)
          .screenshots({
            timestamps: [0],
            filename: path.basename(tempThumbPath),
            folder: path.dirname(tempThumbPath),
            size: '320x240'
          })
          .on('end', resolve)
          .on('error', reject);
      });
      const thumbnailBuffer = fs.readFileSync(tempThumbPath);

      // Clean up temp files
      fs.unlinkSync(tempVideoPath);
      fs.unlinkSync(tempThumbPath);

      // Generate a unique filename for each upload (using timestamp)
      const safeName = path.parse(file.originalname).name.replace(/[^\w\-]+/g, "_");
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now(); // You can use a counter or uuid if you prefer
      const videoFilename = `${safeName}_${uniqueSuffix}${ext}`;
      const videoDropboxPath = `/wise_uploads/${videoFilename}`;
      await uploadToDropbox({ buffer: file.buffer, filename: videoFilename, path: 'wise_uploads/' });
      const videoUrl = await getPermanentLink(videoDropboxPath);

      // Upload thumbnail with unique name
      const thumbFilename = `${safeName}_${uniqueSuffix}_thumb.png`;
      const thumbDropboxPath = `/wise_uploads/${thumbFilename}`;
      await uploadToDropbox({ buffer: thumbnailBuffer, filename: thumbFilename, path: 'wise_uploads/' });
      const thumbUrl = await getPermanentLink(thumbDropboxPath);

     console.log(videoDropboxPath);
     console.log(videoUrl);
     console.log(thumbFilename);
     console.log(thumbDropboxPath);
     console.log(thumbUrl);

     
     let nextPosition = 1;
    const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { position: 'desc' }
    });
    if (lastLesson) nextPosition = lastLesson.position + 1;

      // Save lesson in DB
      const lesson = await prisma.lesson.create({
        data: {
          moduleId,
          title: title || safeName,
          description: description || '',
          type: 'DROPBOX',
          dropboxPath: videoDropboxPath,
          url: videoUrl,
          thumbnail: thumbUrl,
          duration: Math.round(duration),
          position: nextPosition,
        }
      });

      results.push({ lesson, videoUrl, thumbUrl, duration });
    }

    return res.json({ results });
  } catch (e) {
    console.error('Controller error:', e);
    return res.status(500).json({ error: e.message || String(e) });
  }
};
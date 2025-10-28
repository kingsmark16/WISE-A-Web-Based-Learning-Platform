import fs from 'fs';
import os from 'os';
import path from 'path';
import prisma from '../../lib/prisma.js';
import ffmpeg from 'fluent-ffmpeg';
import { uploadToDropbox, getPermanentLink, getVideoDuration, deleteFromDropbox, renameDropboxFile, getStreamableLink } from '../../services/dropboxService.js';
import cloudinary from '../../lib/cloudinary.js';

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

      // Transcode video to optimized MP4 (H.264, lower bitrate)
      const transcodedVideoPath = path.join(os.tmpdir(), `${Date.now()}_transcoded_${file.originalname}`);
      await new Promise((resolve, reject) => {
        ffmpeg(tempVideoPath)
          .outputOptions([
            '-c:v libx264',
            '-preset fast',
            '-crf 28',
            '-c:a aac',
            '-b:a 128k'
          ])
          .save(transcodedVideoPath)
          .on('end', resolve)
          .on('error', reject);
      });

      // Read transcoded video buffer
      const transcodedBuffer = fs.readFileSync(transcodedVideoPath);

      // Generate thumbnail (first frame) using ffmpeg
      const tempThumbPath = path.join(os.tmpdir(), `${Date.now()}_thumb.png`);
      await new Promise((resolve, reject) => {
        ffmpeg(transcodedVideoPath)
          .screenshots({
            timestamps: [0],
            filename: path.basename(tempThumbPath),
            folder: path.dirname(tempThumbPath),
            size: '500x300'
          })
          .on('end', resolve)
          .on('error', reject);
      });
      const thumbnailBuffer = fs.readFileSync(tempThumbPath);

      // Clean up temp files
      fs.unlinkSync(tempVideoPath);
      fs.unlinkSync(transcodedVideoPath);
      fs.unlinkSync(tempThumbPath);

      // Generate a unique filename for each upload (using timestamp)
      const safeName = path.parse(file.originalname).name.replace(/[^\w\-]+/g, "_");
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now();
      const videoFilename = `${safeName}_${uniqueSuffix}${ext}`;
      const videoDropboxPath = `/wise_uploads/${videoFilename}`;
      await uploadToDropbox({ buffer: transcodedBuffer, filename: videoFilename, path: 'wise_uploads/' });
      const videoUrl = await getPermanentLink(videoDropboxPath);
      const streamableVideoUrl = getStreamableLink(videoUrl);

      // Upload thumbnail to Cloudinary
      const uploadedThumbnail = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'video-thumbnails',
            resource_type: 'image',
            transformation: [
              {
                width: 500,
                height: 300,
                crop: 'fill'
              }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(thumbnailBuffer);
      });
      const thumbnailLink = uploadedThumbnail.secure_url;

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
          url: streamableVideoUrl,
          thumbnail: thumbnailLink,
          duration: Math.round(duration),
          position: nextPosition,
        }
      });

      // Mark module as incomplete for all enrolled students if it was previously completed
      try {
        const ProgressService = (await import('../../services/progress.service.js')).default;
        await ProgressService.markModuleIncompleteIfCompleted(moduleId);
      } catch (progressError) {
        console.error('Failed to update progress:', progressError);
      }

      results.push({ lesson, streamableVideoUrl, thumbnailLink, duration });
    }

    return res.json({ results });
  } catch (e) {
    console.error('Controller error:', e);
    return res.status(500).json({ error: e.message || String(e) });
  }
};

// replaced editDropboxLesson to rename in Dropbox first then update DB
export const editDropboxLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title } = req.body;
    if (!title || String(title).trim() === '') {
      return res.status(400).json({ error: 'title is required' });
    }

    const where = /^\d+$/.test(lessonId) ? { id: Number(lessonId) } : { id: lessonId };

    const lesson = await prisma.lesson.findUnique({ where });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Ensure only DROPBOX lessons can be edited here
    const lessonType = String(lesson.type ?? '').trim().toUpperCase();
    if (lessonType !== 'DROPBOX') {
      return res.status(403).json({ error: 'Only DROPBOX lessons can be edited via this endpoint' });
    }

    // If there's an existing Dropbox file, rename it there first, then update DB to match.
    let updatedData = { title: String(title).trim() };

    if (lesson.dropboxPath) {
      try {
        const ext = path.extname(lesson.dropboxPath) || path.extname(lesson.url || '') || '';
        const safeTitle = String(title).trim().replace(/[^\w\-]+/g, "_");
        const newFilename = `${safeTitle}_${Date.now()}${ext}`;
        const newDropboxPath = `/wise_uploads/${newFilename}`;

        // rename on Dropbox (autorename:true will avoid conflict errors)
        const moveResult = await renameDropboxFile(lesson.dropboxPath, newDropboxPath);

        // get new permanent link for the moved file
        const videoUrl = await getPermanentLink(moveResult.newPath || newDropboxPath);
        const streamableVideoUrl = getStreamableLink(videoUrl);

        updatedData.dropboxPath = moveResult.newPath || newDropboxPath;
        updatedData.url = streamableVideoUrl;
      } catch (err) {
        console.error('Failed to rename Dropbox file, aborting DB update:', err);
        return res.status(500).json({ error: 'Failed to update file on Dropbox: ' + (err?.message || String(err)) });
      }
    }

    // Update DB (title + possibly dropboxPath/url if rename happened)
    const updated = await prisma.lesson.update({
      where,
      data: updatedData
    });

    return res.json({ lesson: updated });
  } catch (e) {
    console.error('Edit controller error:', e);
    return res.status(500).json({ error: e.message || String(e) });
  }
};

// new: delete lesson (DB + Dropbox + reorder positions)
export const deleteDropboxLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const where = /^\d+$/.test(lessonId) ? { id: Number(lessonId) } : { id: lessonId };

    const lesson = await prisma.lesson.findUnique({ where });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Robust enum coercion (handles Prisma enums)
    const rawType = lesson.type;
    let lessonType = '';
    try {
      lessonType = (rawType == null) ? '' : String(rawType);
    } catch (err) {
      lessonType = String(rawType ?? '');
    }
    lessonType = lessonType.trim().toUpperCase();

    if (lessonType !== 'DROPBOX') {
      console.warn('Delete blocked: lesson.type does not equal DROPBOX', { lessonId, rawType, lessonType });
      return res.status(403).json({
        error: 'Only DROPBOX lessons can be deleted via this endpoint',
        debug: { lessonId, rawType, lessonType, dropboxPath: lesson.dropboxPath ?? null }
      });
    }

    // best-effort delete from Dropbox; normalize "already deleted" into flags
    let dropboxDeleted = false;
    let dropboxAlreadyDeleted = false;
    if (lesson.dropboxPath) {
      try {
        const result = await deleteFromDropbox(lesson.dropboxPath);
        if (result) {
          if (result.deleted) dropboxDeleted = true;
          if (result.alreadyDeleted) dropboxAlreadyDeleted = true;
        } else {
          // treat non-throwing undefined as success
          dropboxDeleted = true;
        }
      } catch (err) {
        // Log and continue — still attempt DB delete
        console.error('Dropbox delete error (continuing to delete DB record):', err);
      }
    }

    // Delete DB record
    const deleted = await prisma.lesson.delete({ where });

    // Reorder remaining lessons within the module
    // Update positions one-by-one (ascending) to avoid transient unique constraint collisions
    const siblings = await prisma.lesson.findMany({
      where: {
        moduleId: deleted.moduleId,
        position: { gt: deleted.position }
      },
      orderBy: { position: 'asc' }
    });

    for (const s of siblings) {
      try {
        await prisma.lesson.update({
          where: { id: s.id },
          data: { position: s.position - 1 }
        });
      } catch (err) {
        // Log and continue — this should be rare, but avoid aborting the whole operation
        console.error('Failed to update lesson position for id', s.id, err);
      }
    }

    return res.json({
      ok: true,
      dropbox: {
        attempted: !!lesson.dropboxPath,
        deleted: dropboxDeleted,
        alreadyDeleted: dropboxAlreadyDeleted
      }
    });
  } catch (e) {
    console.error('Delete controller error:', e);
    return res.status(500).json({ error: e.message || String(e) });
  }
};
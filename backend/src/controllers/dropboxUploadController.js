import fs from 'fs';
import os from 'os';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import ffmpeg from 'fluent-ffmpeg';
import { uploadToDropbox, getPermanentLink, getVideoDuration, deleteFromDropbox, renameDropboxFile, getStreamableLink } from '../services/dropboxService.js';
import cloudinary from '../lib/cloudinary.js';

const prisma = new PrismaClient();

export const uploadDropboxVideo = async (req, res) => {
  // track client aborts
  let aborted = false;
  req.on?.('aborted', () => {
    aborted = true;
    console.warn('Request aborted by client');
  });

  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No file uploaded' });

    const { moduleId, title, description, position } = req.body;
    if (!moduleId) return res.status(400).json({ error: 'moduleId is required' });

    const results = [];
    for (const file of req.files) {
      if (aborted) {
        // stop early if client already aborted
        return res.status(499).json({ error: 'Client aborted upload' });
      }

      // Get duration (fast check) — bail out if aborted immediately after
      const duration = await getVideoDuration(file.buffer);
      if (aborted) return res.status(499).json({ error: 'Client aborted upload' });

      // Write buffer to temp file for ffmpeg
      const tempVideoPath = path.join(os.tmpdir(), `${Date.now()}_${file.originalname}`);
      fs.writeFileSync(tempVideoPath, file.buffer);
      if (aborted) {
        try { fs.unlinkSync(tempVideoPath); } catch (e) {}
        return res.status(499).json({ error: 'Client aborted upload' });
      }

      // Transcode video to optimized MP4 (H.264, lower bitrate)
      const transcodedVideoPath = path.join(os.tmpdir(), `${Date.now()}_transcoded_${file.originalname}`);
      // keep reference so we can kill ffmpeg if client aborts
      let ffmpegCmd = null;
      try {
        await new Promise((resolve, reject) => {
          ffmpegCmd = ffmpeg(tempVideoPath)
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

          // if client aborts while ffmpeg runs, try to stop it and reject
          req.on?.('aborted', () => {
            try {
              if (ffmpegCmd && typeof ffmpegCmd.kill === 'function') ffmpegCmd.kill('SIGKILL');
            } catch (e) { /* ignore */ }
            reject(new Error('aborted'));
          });
        });
      } catch (err) {
        // cleanup temp files if any and bail with 499 when aborted
        try { fs.unlinkSync(tempVideoPath); } catch (e) {}
        try { if (fs.existsSync(transcodedVideoPath)) fs.unlinkSync(transcodedVideoPath); } catch (e) {}
        if (aborted || /aborted/i.test(String(err?.message || ''))) {
          return res.status(499).json({ error: 'Client aborted upload during processing' });
        }
        throw err;
      }

      if (aborted) {
        try { fs.unlinkSync(tempVideoPath); } catch (e) {}
        try { fs.unlinkSync(transcodedVideoPath); } catch (e) {}
        return res.status(499).json({ error: 'Client aborted upload' });
      }

      // Read transcoded video buffer
      const transcodedBuffer = fs.readFileSync(transcodedVideoPath);

      // Generate thumbnail (first frame)
      const tempThumbPath = path.join(os.tmpdir(), `${Date.now()}_thumb.png`);
      try {
        await new Promise((resolve, reject) => {
          const thumbCmd = ffmpeg(transcodedVideoPath)
            .screenshots({
              timestamps: [0],
              filename: path.basename(tempThumbPath),
              folder: path.dirname(tempThumbPath),
              size: '500x300'
            })
            .on('end', resolve)
            .on('error', reject);

          req.on?.('aborted', () => {
            try { if (thumbCmd && typeof thumbCmd.kill === 'function') thumbCmd.kill('SIGKILL'); } catch (e) {}
            reject(new Error('aborted'));
          });
        });
      } catch (err) {
        // cleanup and abort if client cancelled
        try { fs.unlinkSync(tempVideoPath); } catch (e) {}
        try { fs.unlinkSync(transcodedVideoPath); } catch (e) {}
        try { if (fs.existsSync(tempThumbPath)) fs.unlinkSync(tempThumbPath); } catch (e) {}
        if (aborted || /aborted/i.test(String(err?.message || ''))) {
          return res.status(499).json({ error: 'Client aborted upload during thumbnail generation' });
        }
        throw err;
      }
      const thumbnailBuffer = fs.readFileSync(tempThumbPath);

      // Clean up processing temp files (keep transcodedBuffer in memory)
      try { fs.unlinkSync(tempVideoPath); } catch (e) {}
      try { fs.unlinkSync(transcodedVideoPath); } catch (e) {}
      try { fs.unlinkSync(tempThumbPath); } catch (e) {}

      if (aborted) return res.status(499).json({ error: 'Client aborted upload' });

      // Generate unique filename and upload to Dropbox
      const safeName = path.parse(file.originalname).name.replace(/[^\w\-]+/g, "_");
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now();
      const videoFilename = `${safeName}_${uniqueSuffix}${ext}`;
      const videoDropboxPath = `/wise_uploads/${videoFilename}`;

      // Upload to Dropbox
      try {
        await uploadToDropbox({ buffer: transcodedBuffer, filename: videoFilename, path: 'wise_uploads/' });
      } catch (err) {
        // If upload failed, continue cleanup and bubble error
        console.error('Dropbox upload failed for', videoFilename, err);
        throw err;
      }

      // If client aborted after Dropbox upload, try to delete the uploaded file and skip DB save
      if (aborted) {
        try {
          await deleteFromDropbox(videoDropboxPath).catch(() => {});
        } catch (e) { /* ignore */ }
        return res.status(499).json({ error: 'Client aborted upload after upload to Dropbox; cleaned up' });
      }

      const videoUrl = await getPermanentLink(videoDropboxPath);
      const streamableVideoUrl = getStreamableLink(videoUrl);

      // Upload thumbnail to Cloudinary
      const uploadedThumbnail = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'video-thumbnails',
            resource_type: 'image',
            transformation: [{ width: 500, height: 300, crop: 'fill' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(thumbnailBuffer);
      });

      if (aborted) {
        // cleanup Dropbox file if client aborted after thumbnail upload
        try { await deleteFromDropbox(videoDropboxPath).catch(() => {}); } catch (e) {}
        return res.status(499).json({ error: 'Client aborted upload; cleaned up' });
      }

      const thumbnailLink = uploadedThumbnail.secure_url;

      let nextPosition = 1;
      const lastLesson = await prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { position: 'desc' }
      });
      if (lastLesson) nextPosition = lastLesson.position + 1;

      // Save lesson in DB (only if not aborted)
      if (aborted) {
        try { await deleteFromDropbox(videoDropboxPath).catch(() => {}); } catch (e) {}
        return res.status(499).json({ error: 'Client aborted upload' });
      }

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

      results.push({ lesson, streamableVideoUrl, thumbnailLink, duration });
    }

    return res.json({ results });
  } catch (e) {
    console.error('Controller error:', e);
    // If client aborted, express may have already closed; if not, respond with 500
    if (req.aborted || /aborted/i.test(String(e?.message || ''))) {
      return res.status(499).json({ error: 'Client aborted upload' });
    }
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
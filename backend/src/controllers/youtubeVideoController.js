import { getYouTubeClient } from '../services/googleAuth.js';

import { toPhDateString } from '../utils/time.js';
import { PrismaClient } from '@prisma/client';
import { Readable } from 'stream';
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';


const prisma = new PrismaClient();
const upload = multer(); // Initialize multer for file uploads

// enable keep-alive for long uploads
https.globalAgent.keepAlive = true;

// ---------- time helpers ----------
function safePH(input) {
  try {
    const s = toPhDateString(input);
    return s || null;
  } catch {
    return null;
  }
}

function withPhTime(vl) {
  const obj = { ...vl };
  const c = safePH(vl?.createdAt);
  if (c) obj.createdAtPh = c;
  const u = safePH(vl?.updatedAt);
  if (u) obj.updatedAtPh = u;
  return obj;
}



// Replace your current getVideoDetailsWithRetry function with this improved version:
async function getVideoDetailsWithRetry(yt, videoId, maxRetries = 8, initialDelay = 5000) {
  let delay = initialDelay;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const videoDetails = await yt.videos.list({
        part: ['snippet', 'contentDetails', 'status'],
        id: [videoId]
      });

      const videoMeta = videoDetails?.data?.items?.[0];
      const duration = videoMeta?.contentDetails?.duration;
      const uploadStatus = videoMeta?.status?.uploadStatus;
      const processingStatus = videoMeta?.status?.processingStatus;
      
      console.log(`Attempt ${attempt}:`, {
        videoId,
        duration,
        uploadStatus,
        processingStatus,
        privacyStatus: videoMeta?.status?.privacyStatus
      });

      // Check if video is properly processed and has valid duration
      if (videoMeta && 
          duration && 
          duration.startsWith('PT') && // Should start with PT, not P0D
          duration !== 'PT0S' && 
          uploadStatus === 'processed') {
        console.log(`✅ Video ${videoId} fully processed with duration: ${duration}`);
        return videoMeta;
      }

      // Log current status for debugging
      if (duration === 'P0D') {
        console.log(`⏳ Video ${videoId} still processing (duration: ${duration})`);
      } else if (!duration?.startsWith('PT')) {
        console.log(`⚠️ Unexpected duration format: ${duration}`);
      }

      if (attempt < maxRetries) {
        console.log(`🔄 Waiting ${delay/1000}s before retry ${attempt + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Exponential backoff but cap at 30 seconds
        delay = Math.min(delay * 1.5, 30000);
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Final attempt with warning
  console.warn(`⚠️ Max retries reached for video ${videoId}. Saving with duration = 0`);
  const fallbackDetails = await yt.videos.list({
    part: ['snippet', 'contentDetails', 'status'],
    id: [videoId]
  });
  return fallbackDetails?.data?.items?.[0];
}

// Also update your parseDuration function to handle the P0D case:
function parseDuration(duration) {
  if (!duration || typeof duration !== 'string') {
    console.warn('Invalid duration input:', duration);
    return 0;
  }
  
  // Handle the P0D case specifically (YouTube still processing)
  if (duration === 'P0D' || duration === 'PT0S') {
    console.warn('Video duration is zero or still processing:', duration);
    return 0;
  }
  
  // YouTube duration format: PT4M13S, PT1H2M3S, PT30S, etc.
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    console.warn('Failed to parse duration format:', duration);
    return 0;
  }
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  console.log(`✅ Parsed duration: ${duration} -> ${totalSeconds} seconds`);
  
  return totalSeconds;
}




async function createLesson({ moduleId, videoId, meta, title, description }) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Always append to the end to avoid position conflicts
  // You can implement reordering as a separate operation
  const created = await prisma.$transaction(async (tx) => {
    // Get the next available position
    const lastLesson = await tx.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: 'desc' }
    });
    
    const nextPosition = lastLesson ? lastLesson.position + 1 : 1;

    const created = await tx.lesson.create({
      data: {
        moduleId,
        title: title || meta?.title || 'Untitled',
        description: (description ?? meta?.description) || '',
        thumbnail: meta?.thumbnail || '',
        youtubeId: videoId,
        url: watchUrl,
        position: nextPosition, // Always use next available position
        duration: meta?.duration || 0,
        type: 'YOUTUBE'
      }
    });

    return created;
  });

  return created;
}

// Create multer instance for form data (no file upload needed for updates)
const updateMulter = multer();

// ---------- controllers ----------

// POST /api/youtube-lessons/upload  (multipart: moduleId, title?, description?, position?, file: video)
export async function uploadToYouTube(req, res) {
  const files = req.files;
  const uploadResults = [];
  const failedUploads = [];

  try {
    const { moduleId } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No video file' });
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            createdById: true,
            facultyId: true
          }
        }
      }
    });

    if (!module) return res.status(404).json({ message: 'Module not found', moduleId });


    let videoMetadata = [];

    try {

      videoMetadata = req.body.videoMetadata ? JSON.parse(req.body.videoMetadata) : [];

    } catch (error) {

      videoMetadata = files.map((file, index) => ({
        title: file.originalname.replace(/\.[^/.]+$/, ""),
        description: "",
        position: index + 1
      }));
    }

    if(videoMetadata.length !== files.length) {
      videoMetadata = files.map((file, index) => ({
        title: videoMetadata[index]?.title || file.originalname.replace(/\.[^/.]+$/, ""),
        description: videoMetadata[index]?.description || "",
        position: videoMetadata[index]?.position || index + 1
      }));
    }
     


    const yt = await getYouTubeClient();

    for (let i = 0; i < files.length; i++) {
      try {

        const file = files[i];
        const metadata = videoMetadata[i];

        console.log(`Uploading file ${i + 1}/${files.length}: ${file.originalname}`);

        // compute + sanitize title/description to avoid YouTube API rejection
        let computedTitle = (metadata && typeof metadata.title === 'string') ? metadata.title.trim() : '';
        if (!computedTitle) {
          computedTitle = (file && file.originalname) ? file.originalname.replace(/\.[^/.]+$/, "").trim() : '';
        }
        // strip control characters and collapse whitespace
        if (computedTitle) {
          computedTitle = computedTitle.replace(/[\x00-\x1F\x7F]+/g, '').replace(/\s+/g, ' ').trim();
        }
        if (!computedTitle) computedTitle = 'Untitled';
        // enforce YouTube title length limits (100 chars)
        if (computedTitle.length > 100) computedTitle = computedTitle.slice(0, 100).trim();

        const computedDescription = (metadata && typeof metadata.description === 'string') ? metadata.description : '';

        const snippet = {
          title: computedTitle,
          description: computedDescription,
        };

        console.log('YouTube upload snippet:', { titleLength: (snippet.title || '').length, titlePreview: snippet.title.slice(0, 60) });

        // write upload to a temp file and stream from disk to YouTube to reduce memory pressure
        const tmpDir = os.tmpdir();
        const safeName = file.originalname.replace(/[^\w\-_.]/g, '_');
        const tmpPath = path.join(tmpDir, `${Date.now()}-${Math.random().toString(36).slice(2,9)}-${safeName}`);
        await fs.promises.writeFile(tmpPath, file.buffer);
        
        // retry transient network errors (ECONNRESET, EPIPE, socket hang up)
        const maxRetries = 3;
        let attempt = 0;
        let uploadResponse = null;
        while (attempt < maxRetries) {
          attempt++;
          try {
            const mediaStream = fs.createReadStream(tmpPath);
            uploadResponse = await yt.videos.insert({
              part: ['snippet', 'status'],
              requestBody: {
                snippet,
                status: { privacyStatus: 'unlisted' }
              },
              media: {
                body: mediaStream
              }
            });
            break;
          } catch (err) {
            const msg = String(err?.message || err);
            const transient = err?.code === 'ECONNRESET' || /ECONNRESET|socket hang up|EPIPE|ENETUNREACH/i.test(msg);
            console.error(`YouTube upload attempt ${attempt} failed for ${file.originalname}:`, err?.code || msg);
            if (!transient || attempt >= maxRetries) {
              // cleanup and rethrow
              try { await fs.promises.unlink(tmpPath); } catch {}
              console.error('YouTube upload failed permanently for file:', file.originalname, { snippet });
              throw err;
            }
            // backoff before retry
            await new Promise(r => setTimeout(r, 1000 * attempt));
          }
        }
        // cleanup temp file after successful upload
        try { await fs.promises.unlink(tmpPath); } catch (e) { /* ignore */ }
 
        const videoId = uploadResponse?.data?.id;
        if (!videoId) throw new Error('Upload returned no video ID');

        

        const videoMeta = await getVideoDetailsWithRetry(yt, videoId);

        console.log('Video details from YouTube:', {
          videoId,
          duration: videoMeta?.contentDetails?.duration,
          title: videoMeta?.snippet?.title
        });

        const meta = {
          title: videoMeta?.snippet?.title,
          description: videoMeta?.snippet?.description,
          // pick first available thumbnail size to avoid 404 for mqdefault
          thumbnail:
            videoMeta?.snippet?.thumbnails?.maxres?.url ||
            videoMeta?.snippet?.thumbnails?.standard?.url ||
            videoMeta?.snippet?.thumbnails?.high?.url ||
            videoMeta?.snippet?.thumbnails?.medium?.url ||
            videoMeta?.snippet?.thumbnails?.default?.url ||
            null,
          duration: parseDuration(videoMeta?.contentDetails?.duration || 'PT0S')
        };

        const createdLesson = await createLesson({
          moduleId,
          videoId,
          meta,
          position: Number.isInteger(+metadata.position) ? +metadata.position : undefined,
          title: metadata.title,
          description: metadata.description,
        })

        const response = withPhTime(createdLesson);
        

        uploadResults.push({
          message: `Uploaded ${file.originalname} to YouTube and saved`,
          video: response,
          originalFileName: file.originalname,
        })

        console.log(`Video ${i + 1}/${files.length} uploaded successfully: ${createdLesson.id}`);

      } catch (error) {
        console.error(`Failed to upload video ${i + 1}:`, error);
        failedUploads.push({
          success: false,
          originalFilename: files[i].originalname,
          error: error.message
        });
      }
    }

    res.status(201).json({ 
      message: `Upload complete: ${uploadResults.length} successful, ${failedUploads.length} failed`,
      summary: {
        total: files.length,
        successful: uploadResults.length,
        failed: failedUploads.length
      },
      uploadedVideos: uploadResults,
      failedUploads: failedUploads
    });
  
  } catch (e) {
    console.error('uploadToYouTube error:', e);
    res.status(500).json({ message: 'Upload failed', error: e.message });
  }
}

// PATCH /api/youtube-lessons/:id   (multipart: title?, description?)
export async function updateLesson(req, res) {
  try {
    console.log('Request body:', req.body); // Debug log
    console.log('Request headers:', req.headers['content-type']); // Debug log

    const { id } = req.params;
    
    // Handle multipart form data - req.body should now be populated by multer
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        message: 'Request body is missing or invalid',
        receivedBody: req.body,
        contentType: req.headers['content-type']
      });
    }

    const { title, description } = req.body;

    // Validate input
    if (!title && !description) {
      return res.status(400).json({ 
        message: 'At least one field (title or description) is required',
        receivedFields: Object.keys(req.body)
      });
    }

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({ 
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                createdById: true,
                facultyId: true
              }
            }
          }
        }
      }
    });

    if (!existingLesson) {
      return res.status(404).json({ message: 'Video lesson not found' });
    }

    const videoId = existingLesson.youtubeId;

    try {
      // First, update YouTube video metadata
      const yt = await getYouTubeClient();
      
      // Get current YouTube video details
      const videoDetails = await yt.videos.list({
        part: ['snippet', 'status'],
        id: [videoId]
      });

      const currentVideo = videoDetails?.data?.items?.[0];
      if (!currentVideo) {
        return res.status(404).json({ 
          message: 'YouTube video not found',
          videoId: videoId
        });
      }

      const currentSnippet = currentVideo.snippet || {};
      const currentStatus = currentVideo.status || {};

      // Prepare updated snippet
      const updatedSnippet = {
        ...currentSnippet,
        title: typeof title === 'string' && title.trim() ? title.trim() : currentSnippet.title,
        description: typeof description === 'string' ? description : currentSnippet.description,
        categoryId: currentSnippet.categoryId || '27' // Default to Education category
      };

      console.log(`Updating YouTube video ${videoId}:`, {
        oldTitle: currentSnippet.title,
        newTitle: updatedSnippet.title,
        oldDescription: currentSnippet.description?.substring(0, 50) + '...',
        newDescription: updatedSnippet.description?.substring(0, 50) + '...'
      });

      // Update YouTube video - this must succeed before DB update
      const youtubeUpdateResponse = await yt.videos.update({
        part: ['snippet', 'status'],
        requestBody: {
          id: videoId,
          snippet: updatedSnippet,
          status: currentStatus
        }
      });

      console.log(`✅ YouTube video ${videoId} updated successfully`);

      // Only update database if YouTube update succeeded
      const updateData = {};
      if (typeof title === 'string' && title.trim()) {
        updateData.title = title.trim();
      }
      if (typeof description === 'string') {
        updateData.description = description;
      }

      // Update the lesson in database
      const updatedLesson = await prisma.lesson.update({
        where: { id },
        data: updateData
      });

      console.log(`✅ Database lesson ${id} updated successfully`);

      const response = withPhTime(updatedLesson);

      res.json({ 
        message: 'Video lesson updated successfully (YouTube + Database)', 
        video: response,
        youtubeUpdateStatus: 'success',
        updatedFields: Object.keys(updateData)
      });

    } catch (youtubeError) {
      console.error('YouTube update failed, skipping database update:', youtubeError);

      // Determine the specific error type
      let errorMessage = 'Failed to update YouTube video';
      let statusCode = 500;

      if (youtubeError.code === 403) {
        errorMessage = 'Not authorized to update this YouTube video';
        statusCode = 403;
      } else if (youtubeError.code === 404) {
        errorMessage = 'YouTube video not found';
        statusCode = 404;
      } else if (youtubeError.message?.includes('quota')) {
        errorMessage = 'YouTube API quota exceeded';
        statusCode = 429;
      }

      // Do NOT update database if YouTube update fails
      return res.status(statusCode).json({ 
        message: `${errorMessage}. Database was not updated to maintain consistency.`,
        youtubeError: youtubeError.message,
        youtubeUpdateStatus: 'failed',
        videoId: videoId
      });
    }

  } catch (error) {
    console.error('updateLesson error:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Video lesson not found' });
    }
    
    res.status(500).json({ 
      message: 'Failed to update video lesson', 
      error: error.message 
    });
  }
}

// POST /api/youtube-lessons/register  { moduleId, youtubeUrlOrId, title?, description?, position? }
// export async function registerExisting(req, res) {
//   try {
//     const { moduleId, youtubeUrlOrId, title, description, position } = req.body;
//     const uploaderId = req.user?.id || null;

//     if (!moduleId || typeof moduleId !== 'string') {
//       return res.status(400).json({ message: 'moduleId is required' });
//     }
//     if (!youtubeUrlOrId) {
//       return res.status(400).json({ message: 'youtubeUrlOrId is required' });
//     }

//     const mod = await prisma.module.findUnique({ where: { id: moduleId } });
//     if (!mod) return res.status(404).json({ message: 'Module not found', moduleId });

//     const videoId = parseYouTubeId(youtubeUrlOrId);
//     if (!videoId) return res.status(400).json({ message: 'Invalid YouTube URL or ID' });

//     const meta = await fetchVideoMetaWithKey(videoId); // optional, may be null
//     if (meta?.privacyStatus && meta.privacyStatus !== 'unlisted') {
//       return res.status(400).json({ message: `Video privacy is "${meta.privacyStatus}". Set it to "Unlisted".` });
//     }

//     const dup = await prisma.lesson.findFirst({ where: { moduleId, youtubeId: videoId } });
//     if (dup) return res.status(409).json({ message: 'Video already exists in this module', video: withPhTime(dup) });

//     const created = await createLesson({
//       moduleId, uploaderId, videoId, meta,
//       position: Number.isInteger(+position) ? +position : undefined,
//       title, description
//     });

//     const resp = withPhTime(created);
//     const pubPH = meta?.publishedAt ? safePH(meta.publishedAt) : null;
//     if (pubPH) resp.publishedAtPh = pubPH;

//     res.status(201).json({ message: 'Video registered', video: resp });
//   } catch (e) {
//     console.error('registerExisting error:', e);
//     res.status(500).json({ message: 'Registration failed', error: e.message });
//   }
// }

// // GET /api/youtube-lessons/:id
// export async function getOne(req, res) {
//   try {
//     const v = await prisma.lesson.findUnique({ where: { id: req.params.id } });
//     if (!v) return res.status(404).json({ message: 'Not found' });
//     res.json({ video: withPhTime(v) });
//   } catch (e) {
//     console.error('getOne error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// // GET /api/youtube-lessons/module/:moduleId
// export async function listByModule(req, res) {
//   try {
//     const vs = await prisma.lesson.findMany({
//       where: { moduleId: req.params.moduleId },
//       orderBy: [{ position: 'asc' }, { id: 'asc' }]
//     });
//     res.json({ videos: vs.map(withPhTime) });
//   } catch (e) {
//     console.error('listByModule error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// // GET /api/youtube-lessons/course/:courseId
// export async function listByCourse(req, res) {
//   try {
//     const vs = await prisma.lesson.findMany({
//       where: { module: { courseId: req.params.courseId } },
//       orderBy: [{ moduleId: 'asc' }, { position: 'asc' }]
//     });
//     res.json({ videos: vs.map(withPhTime) });
//   } catch (e) {
//     console.error('listByCourse error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// // PATCH /api/youtube-lessons/:id   { title?, description?, position? }
// export async function update(req, res) {
//   try {
//     const { title, description, position } = req.body;
//     const ex = await prisma.lesson.findUnique({ where: { id: req.params.id } });
//     if (!ex) return res.status(404).json({ message: 'Not found' });

//     let updated = ex;
//     if (typeof title === 'string' || typeof description === 'string') {
//       updated = await prisma.lesson.update({
//         where: { id: ex.id },
//         data: {
//           ...(typeof title === 'string' ? { title } : {}),
//           ...(typeof description === 'string' ? { description } : {})
//         }
//       });
//     }
//     if (Number.isInteger(+position)) {
//       await moveWithinModule(ex.moduleId, ex.id, +position);
//       updated = await prisma.lesson.findUnique({ where: { id: ex.id } });
//     }
//     res.json({ message: 'Updated', video: withPhTime(updated) });
//   } catch (e) {
//     console.error('update error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// // PUT /api/youtube-lessons/:id   { moduleId?, title?, description?, position? }
// export async function putUpdate(req, res) {
//   try {
//     const { title, description, position, moduleId } = req.body;
//     const ex = await prisma.lesson.findUnique({ where: { id: req.params.id } });
//     if (!ex) return res.status(404).json({ message: 'Not found' });

//     if (!moduleId || moduleId === ex.moduleId) {
//       let updated = await prisma.lesson.update({
//         where: { id: ex.id },
//         data: {
//           ...(typeof title === 'string' ? { title } : {}),
//           ...(typeof description === 'string' ? { description } : {})
//         }
//       });
//       if (Number.isInteger(+position)) {
//         await moveWithinModule(ex.moduleId, ex.id, +position);
//         updated = await prisma.lesson.findUnique({ where: { id: ex.id } });
//       }
//       return res.json({ message: 'Updated', video: withPhTime(updated) });
//     }

//     const newMod = await prisma.module.findUnique({ where: { id: moduleId } });
//     if (!newMod) return res.status(404).json({ message: 'Target module not found' });

//     await prisma.$transaction(async (tx) => {
//       const endPos = await tx.lesson.aggregate({
//         where: { moduleId },
//         _max: { position: true }
//       }).then(r => (r._max.position ?? 0) + 1);

//       await tx.lesson.update({
//         where: { id: ex.id },
//         data: {
//           moduleId,
//           position: endPos,
//           ...(typeof title === 'string' ? { title } : {}),
//           ...(typeof description === 'string' ? { description } : {})
//         }
//       });

//       await tx.lesson.updateMany({
//         where: { moduleId: ex.moduleId, position: { gt: ex.position } },
//         data: { position: { decrement: 1 } }
//       });
//     });

//     if (Number.isInteger(+position)) await moveWithinModule(moduleId, ex.id, +position);
//     const final = await prisma.lesson.findUnique({ where: { id: ex.id } });
//     res.json({ message: 'Updated', video: withPhTime(final) });
//   } catch (e) {
//     console.error('putUpdate error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// // POST /api/youtube-lessons/:id/refresh
// export async function refresh(req, res) {
//   try {
//     const v = await prisma.lesson.findUnique({ where: { id: req.params.id } });
//     if (!v) return res.status(404).json({ message: 'Not found' });

//     const meta = await fetchVideoMetaWithKey(v.youtubeId);
//     if (!meta) return res.json({ message: 'No extra metadata (API key missing?)', video: withPhTime(v) });

//     const upd = await prisma.lesson.update({
//       where: { id: v.id },
//       data: {
//         thumbnail: meta.thumbnail || v.thumbnail,
//         duration: meta.durationSeconds ?? v.duration
//       }
//     });
//     const resp = withPhTime(upd);
//     const pubPH = meta?.publishedAt ? safePH(meta.publishedAt) : null;
//     if (pubPH) resp.publishedAtPh = pubPH;

//     res.json({ message: 'Refreshed', video: resp, sourcePrivacy: meta.privacyStatus || null });
//   } catch (e) {
//     console.error('refresh error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// // PATCH /api/youtube-lessons/:id/youtube   { title?, description?, privacyStatus? }
// export async function patchYouTubeMetadata(req, res) {
//   try {
//     const { title, description, privacyStatus } = req.body;
//     const v = await prisma.lesson.findUnique({ where: { id: req.params.id } });
//     if (!v) return res.status(404).json({ message: 'Not found' });

//     const yt = await getYouTubeClient();
//     const list = await yt.videos.list({ id: [v.youtubeId], part: ['snippet', 'status'] });
//     const item = list.data.items?.[0];
//     if (!item) return res.status(404).json({ message: 'YouTube video not found' });

//     const snippet = item.snippet || {};
//     const status = item.status || {};
//     const newSnippet = {
//       ...snippet,
//       title: typeof title === 'string' ? title : snippet.title,
//       description: typeof description === 'string' ? description : snippet.description,
//       categoryId: snippet.categoryId || '27'
//     };
//     const newStatus = { ...status, ...(privacyStatus ? { privacyStatus } : {}) };

//     const updResp = await yt.videos.update({
//       part: ['snippet', 'status'],
//       requestBody: { id: v.youtubeId, snippet: newSnippet, status: newStatus }
//     });

//     if (typeof title === 'string' || typeof description === 'string') {
//       await prisma.lesson.update({
//         where: { id: v.id },
//         data: {
//           ...(typeof title === 'string' ? { title } : {}),
//           ...(typeof description === 'string' ? { description } : {})
//         }
//       });
//     }

//     const latest = await prisma.lesson.findUnique({ where: { id: v.id } });
//     res.json({
//       message: 'YouTube metadata updated',
//       privacyStatus: updResp.data.status?.privacyStatus || newStatus.privacyStatus || null,
//       video: withPhTime(latest)
//     });
//   } catch (e) {
//     console.error('patchYouTubeMetadata error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// // PATCH /api/youtube-lessons/:id/replace   { youtubeUrlOrId, deleteOldFromYouTube? }
// export async function replaceVideo(req, res) {
//   try {
//     const { youtubeUrlOrId, deleteOldFromYouTube } = req.body;
//     const ex = await prisma.lesson.findUnique({ where: { id: req.params.id } });
//     if (!ex) return res.status(404).json({ message: 'Not found' });

//     const newId = parseYouTubeId(youtubeUrlOrId);
//     if (!newId) return res.status(400).json({ message: 'Invalid YouTube URL or ID' });
//     if (newId === ex.youtubeId) return res.status(400).json({ message: 'Same video ID' });

//     const meta = await fetchVideoMetaWithKey(newId);
//     if (meta?.privacyStatus && meta.privacyStatus !== 'unlisted') {
//       return res.status(400).json({ message: `Video privacy is "${meta.privacyStatus}". Set it to "Unlisted".` });
//     }

//     const dup = await prisma.lesson.findFirst({ where: { moduleId: ex.moduleId, youtubeId: newId } });
//     if (dup) return res.status(409).json({ message: 'A lesson in this module already uses that YouTube ID' });

//     const watchUrl = `https://www.youtube.com/watch?v=${newId}`;
//     const upd = await prisma.lesson.update({
//       where: { id: ex.id },
//       data: {
//         youtubeId: newId,
//         url: watchUrl,
//         thumbnail: meta?.thumbnail || ex.thumbnail,
//         duration: meta?.durationSeconds ?? ex.duration
//       }
//     });

//     if (String(deleteOldFromYouTube ?? 'false') === 'true') {
//       try {
//         const yt = await getYouTubeClient();
//         await yt.videos.delete({ id: ex.youtubeId });
//       } catch (e) {
//         console.warn('Old YouTube delete failed:', e.message);
//       }
//     }

//     res.json({ message: 'Video replaced', video: withPhTime(upd) });
//   } catch (e) {
//     console.error('replaceVideo error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// // PATCH /api/youtube-lessons/reorder  { moduleId, order: [{id, position}, ...] }
// export async function bulkReorder(req, res) {
//   try {
//     const { moduleId, order } = req.body;
//     if (!moduleId || !Array.isArray(order) || order.length === 0) {
//       return res.status(400).json({ message: 'moduleId and non-empty order[] required' });
//     }

//     const all = await prisma.lesson.findMany({ where: { moduleId }, select: { id: true } });
//     const idsSet = new Set(all.map(a => a.id));
//     for (const o of order) {
//       if (!idsSet.has(o.id)) return res.status(400).json({ message: `Lesson ${o.id} not in module` });
//       if (!Number.isInteger(+o.position) || +o.position < 1) {
//         return res.status(400).json({ message: 'Positions must be integers >= 1' });
//       }
//     }

//     await prisma.$transaction(async (tx) => {
//       // bump all so we can set exact positions without unique collisions
//       await tx.lesson.updateMany({ where: { moduleId }, data: { position: { increment: 1000 } } });
//       for (const o of order) {
//         await tx.lesson.update({ where: { id: o.id }, data: { position: +o.position } });
//       }
//     });

//     const vs = await prisma.lesson.findMany({
//       where: { moduleId },
//       orderBy: [{ position: 'asc' }, { id: 'asc' }]
//     });
//     res.json({ message: 'Reordered', videos: vs.map(withPhTime) });
//   } catch (e) {
//     console.error('bulkReorder error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// DELETE /api/youtube-lessons/:id?deleteFromYouTube=true|false
export async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleteFromYouTube = String(req.query.deleteFromYouTube ?? 'true') === 'true';

    const ex = await prisma.lesson.findUnique({ where: { id } });
    if (!ex) return res.status(404).json({ message: 'Not found' });

    if (deleteFromYouTube) {
      try {
        const yt = await getYouTubeClient();
        await yt.videos.delete({ id: ex.youtubeId });
      } catch (e) {
        console.warn('YouTube delete failed (continuing DB delete):', e.message);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.lesson.delete({ where: { id } });
      await tx.lesson.updateMany({
        where: { moduleId: ex.moduleId, position: { gt: ex.position } },
        data: { position: { decrement: 1 } }
      });
    });

    res.json({ message: `Deleted${deleteFromYouTube ? ' (YouTube + DB)' : ' (DB only)'}` });
  } catch (e) {
    console.error('remove error:', e);
    res.status(500).json({ message: 'Failed', error: e.message });
  }
}

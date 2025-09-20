// src/controllers/youtubeVideoController.js
import fs from 'fs';
import { getYouTubeClient } from '../services/googleAuth.js';
import { parseYouTubeId, fetchVideoMetaWithKey } from '../storage/providers/youtube.js';
import { toPhDateString } from '../utils/time.js';
import { PrismaClient } from '@prisma/client';
import { Readable } from 'stream';
import { youtube } from 'googleapis/build/src/apis/youtube/index.js';
import { title } from 'process';

const prisma = new PrismaClient();
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

// ---------- position helpers ----------
// --- collision-free reorder (drop-in replacement) ---
async function moveWithinModule(moduleId, lessonId, newPos) {
  await prisma.$transaction(async (tx) => {
    // load ordered list for this module
    const all = await tx.youtubeVideoLesson.findMany({
      where: { moduleId },
      select: { id: true, position: true },
      orderBy: { position: 'asc' },
    });
    const target = all.find((l) => l.id === lessonId);
    if (!target) throw new Error('Lesson not found in module');

    const oldPos = target.position;
    const maxPos = all.length;
    const clamped = Math.max(1, Math.min(+newPos, maxPos));
    if (clamped === oldPos) return; // nothing to do

    // 1) free the target's slot (use 0 which shouldn't exist)
    await tx.youtubeVideoLesson.update({
      where: { id: lessonId },
      data: { position: 0 },
    });

    if (clamped < oldPos) {
      // moving UP: shift [clamped .. oldPos-1] UP by +1
      // update in DESC so we never collide (e.g., 4->5 while 5 is free)
      const affected = await tx.youtubeVideoLesson.findMany({
        where: { moduleId, position: { gte: clamped, lt: oldPos } },
        orderBy: { position: 'desc' },
        select: { id: true, position: true },
      });
      for (const r of affected) {
        await tx.youtubeVideoLesson.update({
          where: { id: r.id },
          data: { position: r.position + 1 },
        });
      }
    } else {
      // moving DOWN: shift [oldPos+1 .. clamped] DOWN by -1
      // update in ASC so we fill the gap progressively
      const affected = await tx.youtubeVideoLesson.findMany({
        where: { moduleId, position: { gt: oldPos, lte: clamped } },
        orderBy: { position: 'asc' },
        select: { id: true, position: true },
      });
      for (const r of affected) {
        await tx.youtubeVideoLesson.update({
          where: { id: r.id },
          data: { position: r.position - 1 },
        });
      }
    }

    // 3) place target in its final position
    await tx.youtubeVideoLesson.update({
      where: { id: lessonId },
      data: { position: clamped },
    });
  });
}

async function createLesson({ moduleId, videoId, meta, position, title, description }) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  let finalPosition = position;

  if (!Number.isInteger(finalPosition) || finalPosition <= 0) {
    const lastLesson = await prisma.youtubeVideoLesson.findFirst({
      where: { moduleId },
      orderBy: { position: 'desc' }
    });
    finalPosition = lastLesson ? lastLesson.position + 1 : 1;
  } else {

    // Check if the desired position already exists
    const existingLesson = await prisma.youtubeVideoLesson.findUnique({
      where: {
        moduleId_position: {
          moduleId,
          position: finalPosition
        }
      }
    });

    if (existingLesson) {
      // If position exists, shift all lessons at that position and higher up by 1
      await prisma.youtubeVideoLesson.updateMany({
        where: {
          moduleId,
          position: {
            gte: finalPosition
          }
        },
        data: {
          position: {
            increment: 1
          }
        }
      });
    }
  }


  const created = await prisma.youtubeVideoLesson.create({
    data: {
      moduleId,
      title: title || meta?.title || 'Untitled',
      description: (description ?? meta?.description) || '',
      thumbnail: meta?.thumbnail || '',
      youtubeId: videoId,
      url: watchUrl,
      position: finalPosition,
      duration: meta?.duration || 0,
    }
  });


  return created;
}

function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

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

        const uploadResponse = await yt.videos.insert({
          part: ['snippet', 'status'],
          requestBody: {
            snippet: {
              title: metadata.title || file.originalname.replace(/\.[^/.]+$/, ""),
              description: metadata.description || '',
            },
            status: { privacyStatus: 'unlisted' }
          },
          media: {
            body: Readable.from(file.buffer)
          }
        })
        
        const videoId = uploadResponse?.data?.id;
        if (!videoId) throw new Error('Upload returned no video ID');

        const videoDetails = await yt.videos.list({
          part: ['snippet', 'contentDetails', 'status'],
          id: [videoId]
        });

        const videoMeta = videoDetails?.data?.items?.[0] || null;
        const meta = {
          title: videoMeta?.snippet?.title,
          description: videoMeta?.snippet?.description,
          thumbnail: videoMeta?.snippet?.thumbnails?.medium?.url || '',
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

//     const dup = await prisma.youtubeVideoLesson.findFirst({ where: { moduleId, youtubeId: videoId } });
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
//     const v = await prisma.youtubeVideoLesson.findUnique({ where: { id: req.params.id } });
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
//     const vs = await prisma.youtubeVideoLesson.findMany({
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
//     const vs = await prisma.youtubeVideoLesson.findMany({
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
//     const ex = await prisma.youtubeVideoLesson.findUnique({ where: { id: req.params.id } });
//     if (!ex) return res.status(404).json({ message: 'Not found' });

//     let updated = ex;
//     if (typeof title === 'string' || typeof description === 'string') {
//       updated = await prisma.youtubeVideoLesson.update({
//         where: { id: ex.id },
//         data: {
//           ...(typeof title === 'string' ? { title } : {}),
//           ...(typeof description === 'string' ? { description } : {})
//         }
//       });
//     }
//     if (Number.isInteger(+position)) {
//       await moveWithinModule(ex.moduleId, ex.id, +position);
//       updated = await prisma.youtubeVideoLesson.findUnique({ where: { id: ex.id } });
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
//     const ex = await prisma.youtubeVideoLesson.findUnique({ where: { id: req.params.id } });
//     if (!ex) return res.status(404).json({ message: 'Not found' });

//     if (!moduleId || moduleId === ex.moduleId) {
//       let updated = await prisma.youtubeVideoLesson.update({
//         where: { id: ex.id },
//         data: {
//           ...(typeof title === 'string' ? { title } : {}),
//           ...(typeof description === 'string' ? { description } : {})
//         }
//       });
//       if (Number.isInteger(+position)) {
//         await moveWithinModule(ex.moduleId, ex.id, +position);
//         updated = await prisma.youtubeVideoLesson.findUnique({ where: { id: ex.id } });
//       }
//       return res.json({ message: 'Updated', video: withPhTime(updated) });
//     }

//     const newMod = await prisma.module.findUnique({ where: { id: moduleId } });
//     if (!newMod) return res.status(404).json({ message: 'Target module not found' });

//     await prisma.$transaction(async (tx) => {
//       const endPos = await tx.youtubeVideoLesson.aggregate({
//         where: { moduleId },
//         _max: { position: true }
//       }).then(r => (r._max.position ?? 0) + 1);

//       await tx.youtubeVideoLesson.update({
//         where: { id: ex.id },
//         data: {
//           moduleId,
//           position: endPos,
//           ...(typeof title === 'string' ? { title } : {}),
//           ...(typeof description === 'string' ? { description } : {})
//         }
//       });

//       await tx.youtubeVideoLesson.updateMany({
//         where: { moduleId: ex.moduleId, position: { gt: ex.position } },
//         data: { position: { decrement: 1 } }
//       });
//     });

//     if (Number.isInteger(+position)) await moveWithinModule(moduleId, ex.id, +position);
//     const final = await prisma.youtubeVideoLesson.findUnique({ where: { id: ex.id } });
//     res.json({ message: 'Updated', video: withPhTime(final) });
//   } catch (e) {
//     console.error('putUpdate error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// // POST /api/youtube-lessons/:id/refresh
// export async function refresh(req, res) {
//   try {
//     const v = await prisma.youtubeVideoLesson.findUnique({ where: { id: req.params.id } });
//     if (!v) return res.status(404).json({ message: 'Not found' });

//     const meta = await fetchVideoMetaWithKey(v.youtubeId);
//     if (!meta) return res.json({ message: 'No extra metadata (API key missing?)', video: withPhTime(v) });

//     const upd = await prisma.youtubeVideoLesson.update({
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
//     const v = await prisma.youtubeVideoLesson.findUnique({ where: { id: req.params.id } });
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
//       await prisma.youtubeVideoLesson.update({
//         where: { id: v.id },
//         data: {
//           ...(typeof title === 'string' ? { title } : {}),
//           ...(typeof description === 'string' ? { description } : {})
//         }
//       });
//     }

//     const latest = await prisma.youtubeVideoLesson.findUnique({ where: { id: v.id } });
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
//     const ex = await prisma.youtubeVideoLesson.findUnique({ where: { id: req.params.id } });
//     if (!ex) return res.status(404).json({ message: 'Not found' });

//     const newId = parseYouTubeId(youtubeUrlOrId);
//     if (!newId) return res.status(400).json({ message: 'Invalid YouTube URL or ID' });
//     if (newId === ex.youtubeId) return res.status(400).json({ message: 'Same video ID' });

//     const meta = await fetchVideoMetaWithKey(newId);
//     if (meta?.privacyStatus && meta.privacyStatus !== 'unlisted') {
//       return res.status(400).json({ message: `Video privacy is "${meta.privacyStatus}". Set it to "Unlisted".` });
//     }

//     const dup = await prisma.youtubeVideoLesson.findFirst({ where: { moduleId: ex.moduleId, youtubeId: newId } });
//     if (dup) return res.status(409).json({ message: 'A lesson in this module already uses that YouTube ID' });

//     const watchUrl = `https://www.youtube.com/watch?v=${newId}`;
//     const upd = await prisma.youtubeVideoLesson.update({
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

//     const all = await prisma.youtubeVideoLesson.findMany({ where: { moduleId }, select: { id: true } });
//     const idsSet = new Set(all.map(a => a.id));
//     for (const o of order) {
//       if (!idsSet.has(o.id)) return res.status(400).json({ message: `Lesson ${o.id} not in module` });
//       if (!Number.isInteger(+o.position) || +o.position < 1) {
//         return res.status(400).json({ message: 'Positions must be integers >= 1' });
//       }
//     }

//     await prisma.$transaction(async (tx) => {
//       // bump all so we can set exact positions without unique collisions
//       await tx.youtubeVideoLesson.updateMany({ where: { moduleId }, data: { position: { increment: 1000 } } });
//       for (const o of order) {
//         await tx.youtubeVideoLesson.update({ where: { id: o.id }, data: { position: +o.position } });
//       }
//     });

//     const vs = await prisma.youtubeVideoLesson.findMany({
//       where: { moduleId },
//       orderBy: [{ position: 'asc' }, { id: 'asc' }]
//     });
//     res.json({ message: 'Reordered', videos: vs.map(withPhTime) });
//   } catch (e) {
//     console.error('bulkReorder error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

// // DELETE /api/youtube-lessons/:id?deleteFromYouTube=true|false
// export async function remove(req, res) {
//   try {
//     const { id } = req.params;
//     const deleteFromYouTube = String(req.query.deleteFromYouTube ?? 'true') === 'true';

//     const ex = await prisma.youtubeVideoLesson.findUnique({ where: { id } });
//     if (!ex) return res.status(404).json({ message: 'Not found' });

//     if (deleteFromYouTube) {
//       try {
//         const yt = await getYouTubeClient();
//         await yt.videos.delete({ id: ex.youtubeId });
//       } catch (e) {
//         console.warn('YouTube delete failed (continuing DB delete):', e.message);
//       }
//     }

//     await prisma.$transaction(async (tx) => {
//       await tx.youtubeVideoLesson.delete({ where: { id } });
//       await tx.youtubeVideoLesson.updateMany({
//         where: { moduleId: ex.moduleId, position: { gt: ex.position } },
//         data: { position: { decrement: 1 } }
//       });
//     });

//     res.json({ message: `Deleted${deleteFromYouTube ? ' (YouTube + DB)' : ' (DB only)'}` });
//   } catch (e) {
//     console.error('remove error:', e);
//     res.status(500).json({ message: 'Failed', error: e.message });
//   }
// }

import path from "path";
import { storage } from "../../storage/index.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const EXPIRES_SEC = 60 * 60 * 4; // 4 hours

const safeBase = (name) =>
  (path.parse(name).name || "document").replace(/[^\w\-]+/g, "_");

// Minimal PDF signature check: file starts with "%PDF-"
function isPdfMagicBuffer(buffer) {
  return buffer.slice(0, 5).toString() === "%PDF-";
}

// POST /upload-pdf
export const uploadPdf = async (req, res) => {
  try {
    console.log('[uploadPdf] Request received:', {
      hasFiles: !!req.files,
      filesCount: req.files?.length || 0,
      body: req.body
    });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No PDF uploaded" });

    // Get moduleId, title, description from body (for all files)
    const { moduleId, title, description } = req.body;

    if(!moduleId) {
      console.error('[uploadPdf] moduleId is undefined');
      return res.status(400).json({message: 'moduleId is undefined'});
    }

    console.log('[uploadPdf] Looking up module:', moduleId);
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
    if (!module) {
      console.error('[uploadPdf] Module not found:', moduleId);
      return res.status(400).json({ message: "Module not found" });
    }

    // Find next position in module
    const last = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: "desc" }
    });
    let position = last ? last.position + 1 : 1;

    const results = [];

    for (const file of req.files) {
      console.log('[uploadPdf] Processing file:', file.originalname);
      
      // Check PDF magic number in buffer
      if (!isPdfMagicBuffer(file.buffer)) {
        console.warn('[uploadPdf] Invalid PDF file:', file.originalname);
        results.push({ error: "Invalid PDF file.", originalname: file.originalname });
        continue;
      }

      const base = safeBase(file.originalname);
      // make filename unique using timestamp + random component
      const unique = `${base}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const filename = `${unique}.pdf`;
      const key = `pdfs/${filename}`;

      console.log('[uploadPdf] Uploading to storage with key:', key);
      
      try {
        // upload with explicit upsert:false (unique key means no conflict)
        await storage.uploadPdf({ key, buffer: file.buffer, upsert: false });
        console.log('[uploadPdf] Upload successful:', key);
      } catch (uploadErr) {
        console.error('[uploadPdf] Storage upload failed:', uploadErr);
        results.push({ 
          error: `Storage upload failed: ${uploadErr.message}`, 
          originalname: file.originalname 
        });
        continue;
      }

      // Short-lived direct links
      const { url: view_url } = await storage.getViewUrl({ key, seconds: EXPIRES_SEC });
      const { url: direct_download_url } = await storage.getDownloadUrl({
        key, filename, seconds: EXPIRES_SEC
      });

      console.log('[uploadPdf] Generated URLs for:', filename);

      // Stable API endpoints
      const preview_api_url  = `${API_BASE}/api/upload-pdf/preview?id=${encodeURIComponent(key)}`;
      const download_api_url = `${API_BASE}/api/upload-pdf/download?id=${encodeURIComponent(key)}&name=${encodeURIComponent(filename)}`;

      // Save as lesson in DB - persist storageKey for future deletes
      // concurrent uploads can race on computing the next position; retry on unique constraint failure
      const maxRetries = 5;
      let attempt = 0;
      let lesson;
      while (attempt < maxRetries) {
        try {
          // recalculate position for this attempt to reduce race window
          const lastLocal = await prisma.lesson.findFirst({
            where: { moduleId },
            orderBy: { position: "desc" }
          });
          const currentPosition = lastLocal ? lastLocal.position + 1 : 1; 

          console.log('[uploadPdf] Creating lesson at position:', currentPosition);

          lesson = await prisma.lesson.create({
            data: {
              moduleId,
              title: title || base,
              description: description || "",
              type: "PDF",
              url: preview_api_url,
              position: currentPosition,
              storageKey: key
            }
          });

          console.log('[uploadPdf] Lesson created:', lesson.id);
          break; // success
        } catch (err) {
          // If unique constraint on (moduleId, position) happened, retry a few times
          const isUniqueConstraint = err?.code === "P2002" && err?.meta?.target && String(err.meta.target).includes("moduleId") && String(err.meta.target).includes("position");
          attempt++;
          console.warn(`[uploadPdf] Lesson create attempt ${attempt} failed:`, err.message);
          if (!isUniqueConstraint || attempt >= maxRetries) {
            // bubble up if not recoverable
            throw err;
          }
          // small backoff to reduce contention
          await new Promise((r) => setTimeout(r, 80 * attempt));
        }
      }

      results.push({
        message: "PDF uploaded",
        key,
        filename,
        view_url,
        direct_download_url,
        preview_api_url,
        download_api_url,
        originalname: file.originalname,
        lesson, // include lesson info
      });

      // increment for local loop only (next iteration will recalc anyway)
      position++;
    }

    console.log('[uploadPdf] Upload complete. Results:', results.length);
    return res.json({ results });
  } catch (e) {
    console.error('[uploadPdf] Error:', e);
    return res.status(500).json({ error: e.message || String(e) });
  }
};

// GET /upload-pdf/preview?id=<key>
export const previewPdf = async (req, res) => {
  try {
    const key = req.query.id;
    if (!key) return res.status(400).json({ error: "Missing id" });
    const { url } = await storage.getViewUrl({ key, seconds: EXPIRES_SEC });
    return res.redirect(302, url); // inline preview
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
};

// GET /upload-pdf/download?id=<key>&name=<filename.pdf>
// export const downloadPdf = async (req, res) => {
//   try {
//     const key = req.query.id;
//     const name = (req.query.name || "document.pdf").replace(/[^\w\-.]+/g, "_");
//     if (!key) return res.status(400).json({ error: "Missing id" });

//     const { url } = await storage.getDownloadUrl({
//       key,
//       filename: name,
//       seconds: EXPIRES_SEC,
//     });
//     return res.redirect(302, url); // forces browser download with proper filename
//   } catch (e) {
//     return res.status(500).json({ error: e.message || String(e) });
//   }
// };

// PUT /upload-pdf/:lessonId  -> edit title only
export const editPdf = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title } = req.body;

    if (!title || String(title).trim() === '') {
      return res.status(400).json({ error: "title is required" });
    }

    const where = /^\d+$/.test(lessonId) ? { id: Number(lessonId) } : { id: lessonId };

    const lesson = await prisma.lesson.findUnique({ where });
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    const rawType = lesson.type;
    const lessonType = (rawType == null) ? "" : String(rawType).trim().toUpperCase();
    if (lessonType !== "PDF") {
      return res.status(403).json({ error: "Only PDF lessons can be edited via this endpoint" });
    }

    const updated = await prisma.lesson.update({
      where,
      data: { title: String(title).trim() }
    });

    return res.json({ lesson: updated });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
};

// DELETE /upload-pdf/:lessonId  -> delete storage file + DB record + reorder positions
export const deletePdf = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const where = /^\d+$/.test(lessonId) ? { id: Number(lessonId) } : { id: lessonId };

    const lesson = await prisma.lesson.findUnique({ where });
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    const rawType = lesson.type;
    const lessonType = (rawType == null) ? "" : String(rawType).trim().toUpperCase();
    if (lessonType !== "PDF") {
      return res.status(403).json({ error: "Only PDF lessons can be deleted via this endpoint" });
    }

    // Resolve storage key: prefer stored storageKey, else try to parse from lesson.url query 'id'
    let key = lesson.storageKey || null;
    if (!key && lesson.url) {
      try {
        const u = new URL(lesson.url);
        key = u.searchParams.get('id') || null;
      } catch (err) {
        // try treat as relative URL with API_BASE
        try {
          const base = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`;
          const u = new URL(lesson.url, base);
          key = u.searchParams.get('id') || null;
        } catch (e) {
          key = null;
        }
      }
    }

    let storageDeleted = false;
    let storageAlreadyDeleted = false;
    if (key) {
      // Attempt several possible delete function names on storage for robustness
      const deleteFns = [
        'deletePdf',
        'delete',
        'remove',
        'deleteObject',
        'delete_file',
        'deleteFile',
        'removeObject'
      ];

      let attempted = false;
      for (const fn of deleteFns) {
        if (typeof storage[fn] === 'function') {
          attempted = true;
          try {
            // many storage.delete variants accept an object { key } or (key)
            const res = storage[fn].length === 1 ? await storage[fn](key) : await storage[fn]({ key });
            storageDeleted = true;
            break;
          } catch (err) {
            const msg = String(err?.message || err || '');
            const lower = msg.toLowerCase();
            if (lower.includes('not found') || lower.includes('no such') || lower.includes('404')) {
              storageAlreadyDeleted = true;
              break;
            } else {
              // log and continue trying other delete functions
              console.warn(`storage.${fn} failed:`, err?.message || err);
            }
          }
        }
      }

      // If none attempted, try generic delete/remove with object argument
      if (!attempted) {
        try {
          if (typeof storage.delete === 'function') {
            await storage.delete({ key });
            storageDeleted = true;
          } else if (typeof storage.remove === 'function') {
            await storage.remove({ key });
            storageDeleted = true;
          } else {
            // nothing to call; leave as not attempted
          }
        } catch (err) {
          const m = String(err?.message || err || '').toLowerCase();
          if (m.includes('not found') || m.includes('no such') || m.includes('404')) {
            storageAlreadyDeleted = true;
          } else {
            console.warn('Generic storage delete attempt failed:', err?.message || err);
          }
        }
      }
    }

    // Delete DB record
    const deleted = await prisma.lesson.delete({ where });

    // Reorder remaining lessons within the module
    await prisma.lesson.updateMany({
      where: {
        moduleId: deleted.moduleId,
        position: { gt: deleted.position }
      },
      data: { position: { decrement: 1 } }
    });

    return res.json({
      ok: true,
      storage: {
        attempted: !!key,
        deleted: storageDeleted,
        alreadyDeleted: storageAlreadyDeleted,
        key: key || null
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
};

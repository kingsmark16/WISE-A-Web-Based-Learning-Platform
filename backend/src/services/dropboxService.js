import fs from 'fs';
import { Dropbox } from 'dropbox';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeStatic from 'ffprobe-static';
import { Readable } from 'stream';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID || null;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET || null;

// persisted will be loaded from DB lazily
let persisted = null;

// --- add token cache and fetch helper ---
const tokenCache = {
  accessToken: null,
  expiresAt: null // ms epoch
};

async function getFetch() {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch;
  const mod = await import('node-fetch');
  return mod.default;
}
// --- end added code ---

async function loadPersistedFromDB() {
  if (persisted !== null) return;
  try {
    const row = await prisma.dropboxToken.findUnique({ where: { id: 'dropbox' } });
    persisted = row || {};
  } catch (e) {
    persisted = {};
  }

  // initialize tokenCache from persisted DB row if present
  if (persisted.access_token) {
    tokenCache.accessToken = persisted.access_token;
  }
  if (persisted.expires_at) {
    tokenCache.expiresAt = new Date(persisted.expires_at).getTime();
  }
}

// helper to persist tokens returned by OAuth token endpoint into DB
async function persistTokens(data) {
  try {
    const expiresIn = data.expires_in || null;
    const now = Date.now();
    const expires_at = expiresIn ? new Date(now + expiresIn * 1000 - 30 * 1000) : null;
    const upsertData = {
      id: 'dropbox',
      access_token: data.access_token,
      // prefer refresh_token returned by OAuth; otherwise keep existing persisted refresh_token
      refresh_token: data.refresh_token || (persisted && persisted.refresh_token) || null,
      expires_at
    };

    await prisma.dropboxToken.upsert({
      where: { id: 'dropbox' },
      create: upsertData,
      update: upsertData
    });

    // update in-memory cache & persisted snapshot
    tokenCache.accessToken = upsertData.access_token;
    tokenCache.expiresAt = expires_at ? expires_at.getTime() : null;
    persisted = {
      access_token: upsertData.access_token,
      refresh_token: upsertData.refresh_token,
      expires_at: expires_at
    };
  } catch (e) {
    // fallback to in-memory only
    tokenCache.accessToken = data.access_token;
    tokenCache.expiresAt = Date.now() + ((data.expires_in || 14400) * 1000) - (30 * 1000);
  }
}

// Ensure DB persisted tokens are loaded before using refresh or ensure
async function refreshAccessToken() {
  await loadPersistedFromDB();
  // Use the refresh token from persisted DB row
  const refreshToken = (persisted && persisted.refresh_token);
  if (!refreshToken || !DROPBOX_CLIENT_ID || !DROPBOX_CLIENT_SECRET) {
    throw new Error('Missing Dropbox refresh token in DB or missing DROPBOX_CLIENT_ID / DROPBOX_CLIENT_SECRET in env.');
  }

  const fetchFn = await getFetch();

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  const basicAuth = Buffer.from(`${DROPBOX_CLIENT_ID}:${DROPBOX_CLIENT_SECRET}`).toString('base64');

  const res = await fetchFn('https://api.dropbox.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to refresh Dropbox token: ${res.status} ${res.statusText} ${body}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('No access_token returned when refreshing Dropbox token');
  }

  await persistTokens(data);
  return tokenCache.accessToken;
}

async function ensureAccessToken() {
  await loadPersistedFromDB();
  const now = Date.now();

  if (tokenCache.accessToken && tokenCache.expiresAt && now < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  // No env access token fallback: require refresh token in DB
  // This will attempt to refresh using the persisted refresh_token (must exist)
  // If absent, refreshAccessToken() will throw and caller will see the error.

  return await refreshAccessToken();
}

async function getDropboxClient() {
  const accessToken = await ensureAccessToken();
  // Dropbox SDK may require fetch; pass global fetch if needed in some runtimes
  return new Dropbox({ accessToken });
}

export const uploadToDropbox = async ({ buffer, filename, path = '' }) => {
  const client = await getDropboxClient();
  // normalize path: ensure folder path starts and ends without duplicated slashes
  const folder = String(path || '').replace(/^\/+|\/+$/g, '');
  const dropboxPath = `/${folder}/${filename}`.replace(/\/+/g, '/');

  // call filesUpload with correct mode (add or overwrite as needed)
  const res = await client.filesUpload({
    path: dropboxPath,
    contents: buffer,
    mode: { '.tag': 'add' }
  });

  // return the metadata object so callers can use path_lower/path_display
  return res.result ? res.result : res;
};

export const getPermanentLink = async (dropboxPath) => {
  const dbx = await getDropboxClient();

  // Try to create a shared link, but if that fails try safe fallbacks:
  // 1) list existing shared links
  // 2) get a temporary link
  try {
    const createRes = await dbx.sharingCreateSharedLinkWithSettings({ path: dropboxPath });
    const url = createRes?.result?.url || createRes?.url || createRes?.link;
    if (url) return String(url).replace('?dl=0', '?dl=1');
  } catch (createErr) {
    // If shared link already exists (Dropbox returns 409 / shared_link_already_exists),
    // immediately try to list existing shared links instead of only logging.
    const summary = createErr?.error?.error_summary || createErr?.error_summary || createErr?.message || String(createErr);
    const s = String(summary).toLowerCase();
    if (s.includes('shared_link_already_exists') || s.includes('already_exists') || (createErr?.status === 409)) {
      try {
        const listRes = await dbx.sharingListSharedLinks({ path: dropboxPath, direct_only: true });
        const links = listRes?.result?.links || listRes?.links;
        if (Array.isArray(links) && links.length > 0) {
          const url = links[0]?.url || links[0]?.link;
          if (url) return String(url).replace('?dl=0', '?dl=1');
        }
      } catch (listErrInner) {
        console.warn('sharingListSharedLinks after create 409 failed:', listErrInner?.message || listErrInner);
      }
    } else {
      // continue to fallback attempts for other errors
      console.warn('sharingCreateSharedLinkWithSettings failed (will try fallback):', createErr?.message || createErr);
    }
  }

  // Fallback: list existing shared links
  try {
    const listRes = await dbx.sharingListSharedLinks({ path: dropboxPath, direct_only: true });
    const links = listRes?.result?.links || listRes?.links;
    if (Array.isArray(links) && links.length > 0) {
      const url = links[0]?.url || links[0]?.link;
      if (url) return String(url).replace('?dl=0', '?dl=1');
    }
  } catch (listErr) {
    console.warn('sharingListSharedLinks fallback failed:', listErr?.message || listErr);
  }

  // Final fallback: temporary link
  try {
    const tmpRes = await dbx.filesGetTemporaryLink({ path: dropboxPath });
    const tmpLink = tmpRes?.result?.link || tmpRes?.link;
    if (tmpLink) return tmpLink;
  } catch (tmpErr) {
    console.warn('filesGetTemporaryLink fallback failed:', tmpErr?.message || tmpErr);
  }

  throw new Error('Dropbox permanent link failed: unable to create or retrieve link for ' + dropboxPath);
};

export const getVideoDuration = async (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    ffmpeg(stream)
      .ffprobe((err, data) => {
        if (err) return reject(err);
        resolve(data.format.duration);
      });
  });
};

// new helper to delete a file from Dropbox
export const deleteFromDropbox = async (dropboxPath) => {
  if (!dropboxPath) return null;
  const client = await getDropboxClient();
  // normalize incoming path to start with a single slash
  let normalized = String(dropboxPath).trim();
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  normalized = normalized.replace(/\/+/g, '/');

  try {
    const res = await client.filesDeleteV2({ path: normalized });
    return { deleted: true, meta: res.result };
  } catch (err) {
    // If Dropbox reports path not found, mark as alreadyDeleted
    const msg = String(err?.message || '');
    if (/not_found/i.test(msg) || (err?.status && err.status === 409)) {
      return { deleted: false, alreadyDeleted: true, error: err };
    }
    throw err;
  }
};

// new: rename / move a Dropbox file (returns info about result)
export const renameDropboxFile = async (oldPath, newPath) => {
  const dbx = await getDropboxClient();
  try {
    const response = await dbx.filesMoveV2({
      from_path: oldPath,
      to_path: newPath,
      autorename: true
    });
    const meta = response?.result?.metadata;
    const movedPath = meta?.path_display || meta?.path_lower || newPath;
    return { moved: true, response, newPath: movedPath };
  } catch (error) {
    const summary = error?.error?.error_summary || error?.error_summary || error?.message || String(error);
    const s = String(summary).toLowerCase();

    // If source is missing, indicate alreadyDeleted so caller can decide
    if (s.includes('not_found') || s.includes('path/not_found')) {
      return { moved: false, alreadyDeleted: true, info: summary };
    }

    // On conflict / 409 (target exists) attempt copy+delete as a fallback move
    if (s.includes('already_exists') || s.includes('conflict') || s.includes('409') || s.includes('path/conflict') || s.includes('to') && s.includes('already_exists')) {
      try {
        const copyRes = await dbx.filesCopyV2({
          from_path: oldPath,
          to_path: newPath,
          autorename: true
        });
        const meta = copyRes?.result?.metadata;
        const finalPath = meta?.path_display || meta?.path_lower || newPath;
        // best-effort delete old file (ignore errors)
        try { await dbx.filesDeleteV2({ path: oldPath }); } catch (delErr) { /* ignore */ }
        return { moved: true, response: copyRes, newPath: finalPath, copied: true };
      } catch (copyErr) {
        throw new Error('Dropbox rename fallback (copy+delete) failed: ' + (copyErr?.message || String(copyErr)));
      }
    }

    throw new Error('Dropbox rename failed: ' + (error?.message || String(error)));
  }
};

export const getStreamableLink = (url) => {
  if (!url) return url;
  try {
    let u = String(url);

    // If it is a Dropbox "www.dropbox.com" shared link, convert to dl.dropboxusercontent.com
    // Example: https://www.dropbox.com/s/abcd/file.mp4?dl=0  ->  https://dl.dropboxusercontent.com/s/abcd/file.mp4
    if (/dropbox\.com\/s\//i.test(u)) {
      u = u.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      // remove dl query if present
      u = u.replace(/(\?|\&)dl=\d+/i, '');
      // remove trailing '?' if empty
      u = u.replace(/\?$/,'');
      return u;
    }

    // If it's a Dropbox shared link of other forms, try convert dl=0 or dl=1 to raw=1
    if (u.includes('dl=0') || u.includes('dl=1')) {
      u = u.replace(/dl=\d+/g, 'raw=1');
      return u;
    }

    // Temporary links (filesGetTemporaryLink) should already be direct; return as-is
    return u;
  } catch (err) {
    return url;
  }
};
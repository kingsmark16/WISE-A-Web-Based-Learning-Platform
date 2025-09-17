// src/storage/providers/youtube.js (ESM-safe, no regex literal gotchas)
import axios from 'axios';

export function parseYouTubeId(input) {
  if (!input) return null;

  const s = String(input).trim();
  const idRe = /^[A-Za-z0-9_-]{11}$/;

  // already an ID?
  if (idRe.test(s)) return s;

  // try URL parsing (handles youtu.be, /watch?v=, /shorts/, /embed/)
  try {
    const url = s.startsWith('http://') || s.startsWith('https://') ? s : `https://${s}`;
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');

    if (host === 'youtu.be') {
      const seg = u.pathname.split('/').filter(Boolean)[0];
      return idRe.test(seg) ? seg : null;
    }

    if (host.endsWith('youtube.com')) {
      if (u.pathname === '/watch') {
        const v = u.searchParams.get('v');
        return idRe.test(v || '') ? v : null;
      }
      const parts = u.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'shorts' || parts[0] === 'embed') && parts[1]) {
        return idRe.test(parts[1]) ? parts[1] : null;
      }
    }
  } catch {
    // fall through
  }

  // final fallback (query-string style)
  const m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

export function iso8601ToSeconds(iso) {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] || '0', 10);
  const mi = parseInt(m[2] || '0', 10);
  const s = parseInt(m[3] || '0', 10);
  return h * 3600 + mi * 60 + s;
}

export async function fetchVideoMetaWithKey(videoId) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  try {
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: { id: videoId, key, part: 'snippet,contentDetails,status' }
    });
    const item = data?.items?.[0];
    if (!item) return null;

    const sn = item.snippet, cd = item.contentDetails, st = item.status;
    const thumb =
      sn?.thumbnails?.maxres?.url ||
      sn?.thumbnails?.standard?.url ||
      sn?.thumbnails?.high?.url ||
      sn?.thumbnails?.medium?.url ||
      sn?.thumbnails?.default?.url ||
      null;

    return {
      title: sn?.title || 'Untitled',
      description: sn?.description || null,
      durationSeconds: cd?.duration ? iso8601ToSeconds(cd.duration) : null,
      thumbnail: thumb,
      privacyStatus: st?.privacyStatus || null,
      publishedAt: sn?.publishedAt || null,
      channelTitle: sn?.channelTitle || null
    };
  } catch {
    return null;
  }
}

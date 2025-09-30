import { Router } from 'express';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();

// NOTE: set DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET and DROPBOX_REDIRECT_URI in your .env
// Add the DROPBOX_REDIRECT_URI to your Dropbox app settings (Exact match)

const CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || 'http://localhost:3000/api/dropbox-auth/callback';

// Start OAuth: redirect user to Dropbox authorize page
router.get('/start', (req, res) => {
  if (!CLIENT_ID) return res.status(500).send('Missing DROPBOX_CLIENT_ID in env');
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    token_access_type: 'offline',
    redirect_uri: REDIRECT_URI
  });
  const url = `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
  res.redirect(url);
});

// Callback: exchange code for tokens and persist to TOKEN_FILE
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code query param');

  if (!CLIENT_ID || !CLIENT_SECRET) return res.status(500).send('Missing DROPBOX_CLIENT_ID or DROPBOX_CLIENT_SECRET');

  try {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', REDIRECT_URI);

    const fetchFn = typeof globalThis.fetch === 'function' ? globalThis.fetch : (await import('node-fetch')).default;
    const tokenRes = await fetchFn('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(500).json({ error: 'Token exchange failed', detail: data });
    }

    // Persist tokens to DB (single row with id='dropbox')
    const now = Date.now();
    const expires_at = data.expires_in ? new Date(now + data.expires_in * 1000 - 30 * 1000) : null;
    await prisma.dropboxToken.upsert({
      where: { id: 'dropbox' },
      create: {
        id: 'dropbox',
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at
      },
      update: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at
      }
    });

    // Return simple success with instructions
    res.send(`
      <p>Dropbox tokens saved to database (DropboxToken id='dropbox')</p>
      <p>Refresh token (save to env or secrets storage if you prefer): <code>${data.refresh_token}</code></p>
      <p>Close this window and restart your server if you rely on env vars.</p>
    `);
  } catch (err) {
    console.error('Dropbox callback error', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
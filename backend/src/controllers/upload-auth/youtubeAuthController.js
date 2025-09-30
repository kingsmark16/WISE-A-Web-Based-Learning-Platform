import { getAuthUrl, handleOAuthCallback } from '../../services/googleAuth.js';

export function start(req, res) {
  const url = getAuthUrl('yt-oauth');
  res.redirect(url);
}

export async function callback(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code');
    await handleOAuthCallback(code);
    res.send('YouTube channel connected! You can close this tab.');
  } catch (e) {
    console.error('OAuth callback error:', e);
    res.status(500).send('OAuth failed: ' + e.message);
  }
}

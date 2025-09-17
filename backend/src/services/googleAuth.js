import { google } from 'googleapis';
import { getTokens, saveTokens } from './tokenStore.js';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

function newOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );
  client.on('tokens', (t) => saveTokens(t).catch(err => console.error('saveTokens failed', err)));
  return client;
}

export async function getAuthorizedOAuth2Client() {
  const client = newOAuth2Client();
  const tokens = await getTokens();
  if (tokens) client.setCredentials(tokens);
  return client;
}

export function getAuthUrl(state = '') {
  const client = newOAuth2Client();
  return client.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent', state });
}

export async function handleOAuthCallback(code) {
  const client = newOAuth2Client();
  const { tokens } = await client.getToken(code);
  await saveTokens(tokens);
  client.setCredentials(tokens);
  return tokens;
}

export async function getYouTubeClient() {
  const auth = await getAuthorizedOAuth2Client();
  return google.youtube({ version: 'v3', auth });
}

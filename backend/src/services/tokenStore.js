import { clerkClient } from '@clerk/express';

const OWNER = process.env.YT_OWNER_CLERK_ID;
if (!OWNER) console.warn('YT_OWNER_CLERK_ID not set');

export async function getTokens() {
  const u = await clerkClient.users.getUser(OWNER);
  return (u.privateMetadata && u.privateMetadata.youtubeOAuth) || null;
}

export async function saveTokens(tokens) {
  const u = await clerkClient.users.getUser(OWNER);
  const existing = (u.privateMetadata && u.privateMetadata.youtubeOAuth) || {};
  await clerkClient.users.updateUser(OWNER, {
    privateMetadata: { ...u.privateMetadata, youtubeOAuth: { ...existing, ...tokens } }
  });
}

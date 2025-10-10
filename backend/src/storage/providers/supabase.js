import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,  // server-only key
  { auth: { persistSession: false } }
);

const BUCKET = process.env.SUPABASE_BUCKET || "pdfs";

export async function uploadBuffer({ key, buffer, contentType, upsert = false }) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType, upsert });
  if (error) throw error;
  return { key };
}

export async function signedUrl({ key, expiresIn = 60 * 60, downloadName }) {
  const opts = downloadName ? { download: downloadName } : undefined;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(key, expiresIn, opts);
  if (error) throw error;
  return { url: data.signedUrl };
}

export async function removeObject(key) {
  const { error } = await supabase.storage.from(BUCKET).remove([key]);
  if (error) throw error;
}

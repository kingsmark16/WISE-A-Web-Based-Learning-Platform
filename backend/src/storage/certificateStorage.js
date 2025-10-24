import { uploadBuffer, signedUrl } from "../storage/providers/supabase.js";

export async function uploadBufferToSupabase(buffer, publicId) {
  const year = new Date().getFullYear();
  const key = `certificates/${year}/${publicId}.pdf`;

  try {
    await uploadBuffer({ key, buffer, contentType: "application/pdf", upsert: false });
  } catch (err) {
    const msg = String(err?.message || err);
    if (!/already exists|duplicate|conflict/i.test(msg)) throw err;
  }

  const tenYears = 60 * 60 * 24 * 365 * 10;
  const { url } = await signedUrl({ key, expiresIn: tenYears });
  return { directUrl: url, path: key };
}
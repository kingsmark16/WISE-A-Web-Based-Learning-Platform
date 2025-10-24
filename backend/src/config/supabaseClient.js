import { createClient } from "@supabase/supabase-js";
import { readFirst, readBool, readInt } from "./env.js";

// Accept common aliases so you don't rename .env
export const SUPABASE_URL = readFirst(
  ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_PROJECT_URL"],
  { required: true }
);
export const SUPABASE_SERVICE_ROLE_KEY = readFirst(
  ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE", "SUPABASE_SECRET", "SUPABASE_ADMIN_KEY"],
  { required: true }
);
export const SUPABASE_BUCKET = readFirst(
  ["SUPABASE_BUCKET", "SUPABASE_PDF_BUCKET", "PDF_BUCKET", "CERT_BUCKET"],
  { fallback: "uploads" } // <- single bucket reuse
);
export const SUPABASE_CERT_PUBLIC = readBool(["SUPABASE_CERT_PUBLIC"], false);
export const SUPABASE_CERT_SIGNED_EXP = readInt(["SUPABASE_CERT_SIGNED_EXP"], 315360000);

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export function readFirst(keys, { required = false, fallback } = {}) {
  for (const k of keys) {
    const v = process.env[k];
    if (v !== undefined && v !== "") return v;
  }
  if (required && fallback === undefined) {
    throw new Error(`Missing env. Tried: ${keys.join(", ")}`);
  }
  return fallback;
}
export function readBool(keys, fallback = false) {
  const v = readFirst(keys, { fallback: undefined });
  if (v === undefined) return fallback;
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}
export function readInt(keys, fallback) {
  const v = readFirst(keys, { fallback: undefined });
  if (v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

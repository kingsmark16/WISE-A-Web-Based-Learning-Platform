export function getClerkId(req) {
  try {
    if (typeof req.auth === "function") {
      const a = req.auth();
      if (a?.userId) return a.userId;
    }
    if (req.auth?.userId) return req.auth.userId;
  } catch {}
  return null;
}

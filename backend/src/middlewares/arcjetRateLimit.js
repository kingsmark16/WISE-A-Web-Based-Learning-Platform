import arcjet, { slidingWindow, shield } from "@arcjet/node";
import { getAj } from "../lib/arcjetClient.js";

export async function arcjetRateLimit(req, res, next) {
  try {
    const aj = getAj();
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      if (decision.reason?.isRateLimit?.()) {
        const retryAfterMs = decision.reason.retryAfter;
        if (retryAfterMs) {
          const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
          res.set("Retry-After", String(retryAfterSeconds));
        }
        return res.status(429).json({ error: "Too Many Requests" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  } catch (e) {
    console.warn("Arcjet (global) error:", e);
    next();
  }
}

export function strictRateLimit(window = "30s", max = 10) {
  const MODE = (process.env.ARCJET_MODE || "LIVE").toUpperCase();

  const strictRule = slidingWindow({
    mode: MODE,
    interval: window,
    max,
  });

  return async (req, res, next) => {
    try {
      // Create a dedicated Arcjet client that only contains the strict rule
      const ajStrict = arcjet({
        key: process.env.ARCJET_KEY,
        rules: [shield({ mode: MODE }), strictRule],
      });

      const decision = await ajStrict.protect(req);

      if (decision.isDenied()) {
        if (decision.reason?.isRateLimit?.()) {
          const retryAfterMs = decision.reason.retryAfter;
          if (retryAfterMs) {
            const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
            res.set("Retry-After", String(retryAfterSeconds));
          }
          return res.status(429).json({ error: "Too Many Requests" });
        }
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    } catch (e) {
      console.warn("Arcjet (strict) error:", e);
      next();
    }
  };
}

import { getAj } from "../lib/arcjetClient.js";
import { slidingWindow } from "@arcjet/node"; 

export async function arcjetRateLimit(req, res, next) {
  try {
    const aj = getAj();
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      if (decision.reason?.isRateLimit?.()) {
        const ra = decision.reason.retryAfter && Math.ceil(Number(decision.reason.retryAfter) / 1000);
        if (ra) res.set("Retry-After", String(ra));
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

export function strictRateLimit(window = "1m", max = 10) {
  const MODE = (process.env.ARCJET_MODE || "LIVE").toUpperCase();

  const strictRule = slidingWindow({
    mode: MODE,
    interval: window,
    max,
  });

  return async (req, res, next) => {
    try {
      const ajStrict = getAj().withRule(strictRule); 
      const decision = await ajStrict.protect(req);

      if (decision.isDenied()) {
        if (decision.reason?.isRateLimit?.()) {
          const ra = decision.reason.retryAfter && Math.ceil(Number(decision.reason.retryAfter) / 1000);
          if (ra) res.set("Retry-After", String(ra));
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

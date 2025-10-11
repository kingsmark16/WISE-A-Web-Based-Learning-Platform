// backend/src/lib/arcjetClient.js
import arcjet, { slidingWindow, shield } from "@arcjet/node";

/**
 * Lazy Arcjet client initialization.
 * Ensures env values are loaded *after* dotenv runs.
 */
let ajSingleton = null;

export function getAj() {
  if (ajSingleton) return ajSingleton;

  const MODE = (process.env.ARCJET_MODE || "LIVE").toUpperCase();
  if (MODE !== "LIVE") {
    console.warn("[Arcjet] Running in", MODE, "mode (requests will NOT be blocked).");
  } else {
    console.log("[Arcjet] Live mode enabled (real 429s will be returned).");
  }

  ajSingleton = arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
      shield({ mode: MODE }),
      slidingWindow({
        mode: MODE,
        interval: process.env.ARCJET_LIMIT_WINDOW || "1m",
        max: Number(process.env.ARCJET_LIMIT_MAX || 120),
      }),
    ],
  });

  return ajSingleton;
}

import crypto from "crypto";

export function generateCertificateNumber(prefix = "WISE") {
  const s = crypto.randomBytes(8).toString("base64url").toUpperCase().replace(/[^A-Z0-9]/g,"");
  return [prefix, new Date().getFullYear(), s.slice(0,4), s.slice(4,8), s.slice(8,10)].join("-");
}

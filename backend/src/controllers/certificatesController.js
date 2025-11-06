import { PrismaClient } from "@prisma/client";
import { getClerkId } from "../utils/getClerkId.js";
const prisma = new PrismaClient();

export const listMine = async (req, res, next) => {
  try {
    const clerkId = getClerkId(req);
    if (!clerkId) return res.status(401).json({ ok:false, message:"Not authenticated" });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(401).json({ ok:false, message:"User not provisioned in DB" });

    const certs = await prisma.certificate.findMany({
      where: { userId: user.id },
      orderBy: { issueDate: "desc" },
      include: { course: true },
    });
    return res.json({ ok: true, certificates: certs });
  } catch (e) { next(e); }
};

export const verifyPublic = async (req, res, next) => {
  try {
    const code = String(req.query.code || "");
    if (!code) return res.status(400).send("Missing code");

    const cert = await prisma.certificate.findUnique({
      where: { certificateNumber: code },
      include: { user: true, course: true },
    });
    if (!cert) return res.status(404).send("Certificate not found");

    return res.json({
      certificateNumber: cert.certificateNumber,
      issueDate: cert.issueDate,
      student: cert.user.fullName || cert.user.emailAddress,
      course: cert.course.title,
      url: cert.certificateUrl,
    });
  } catch (e) { next(e); }
};

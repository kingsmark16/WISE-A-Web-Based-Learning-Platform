import { PrismaClient } from "@prisma/client";
import { markCompletedAndAutoIssue } from "../services/completion.service.js";
import { getClerkId } from "../utils/getClerkId.js";
const prisma = new PrismaClient();

export const completeCourse = async (req, res, next) => {
  try {
    const clerkId = getClerkId(req);
    if (!clerkId) return res.status(401).json({ ok:false, message: "Not authenticated" });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(401).json({ ok:false, message: "User not provisioned in DB" });

    const courseId = req.params.courseId || req.body.courseId;
    if (!courseId) return res.status(400).json({ ok:false, message: "Missing courseId" });

    const { completion, certificate } =
      await markCompletedAndAutoIssue(user.id, courseId); // internal ULID

    res.json({ ok: true, completion, certificate });
  } catch (e) { next(e); }
};
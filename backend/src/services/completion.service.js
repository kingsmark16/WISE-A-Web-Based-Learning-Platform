import { PrismaClient } from "@prisma/client";
import { issueCertificateForCompletion } from "./certificate.service.js";
const prisma = new PrismaClient();

export async function markCompletedAndAutoIssue(userId, courseId, signatories = []) {
  const completion = await prisma.courseCompletion.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
    include: { certificate: true },
  });

  if (completion.certificate) return { completion, certificate: completion.certificate };

  const certificate = await issueCertificateForCompletion(completion.id, signatories);
  return { completion, certificate };
}

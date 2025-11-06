/*
  Warnings:

  - You are about to drop the column `isPublished` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `totalLessons` on the `CourseProgress` table. All the data in the column will be lost.
  - You are about to drop the column `totalQuizzes` on the `CourseProgress` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "isPublished",
ADD COLUMN     "status" "public"."CourseStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "public"."CourseProgress" DROP COLUMN "totalLessons",
DROP COLUMN "totalQuizzes",
ADD COLUMN     "averageQuizScore" DOUBLE PRECISION,
ADD COLUMN     "currentModuleId" TEXT;

-- AlterTable
ALTER TABLE "public"."LessonProgress" ADD COLUMN     "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."QuizSubmission" ADD COLUMN     "timeSpent" INTEGER;

-- CreateTable
CREATE TABLE "public"."ModuleProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "quizCompleted" BOOLEAN NOT NULL DEFAULT false,
    "quizScore" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModuleProgress_studentId_idx" ON "public"."ModuleProgress"("studentId");

-- CreateIndex
CREATE INDEX "ModuleProgress_moduleId_idx" ON "public"."ModuleProgress"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleProgress_studentId_moduleId_key" ON "public"."ModuleProgress"("studentId", "moduleId");

-- AddForeignKey
ALTER TABLE "public"."ModuleProgress" ADD CONSTRAINT "ModuleProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuleProgress" ADD CONSTRAINT "ModuleProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

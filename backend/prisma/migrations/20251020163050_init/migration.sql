/*
  Warnings:

  - The values [SHORT_ANSWER] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `chapterId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Chapter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoLesson` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[moduleId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `moduleId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."LessonType" AS ENUM ('PDF', 'YOUTUBE', 'DROPBOX');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."QuestionType_new" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'ENUMERATION');
ALTER TABLE "public"."QuizQuestion" ALTER COLUMN "type" TYPE "public"."QuestionType_new" USING ("type"::text::"public"."QuestionType_new");
ALTER TYPE "public"."QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "public"."QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "public"."QuestionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chapter" DROP CONSTRAINT "Chapter_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Enrollment" DROP CONSTRAINT "Enrollment_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ForumPost" DROP CONSTRAINT "ForumPost_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ForumReply" DROP CONSTRAINT "ForumReply_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VideoLesson" DROP CONSTRAINT "VideoLesson_chapterId_fkey";

-- DropIndex
DROP INDEX "public"."Quiz_chapterId_key";

-- AlterTable
ALTER TABLE "public"."ForumPost" ADD COLUMN     "category" TEXT,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Quiz" DROP COLUMN "chapterId",
ADD COLUMN     "attemptLimit" INTEGER,
ADD COLUMN     "moduleId" TEXT NOT NULL,
ALTER COLUMN "timeLimit" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."QuizQuestion" DROP COLUMN "explanation";

-- DropTable
DROP TABLE "public"."Attachment";

-- DropTable
DROP TABLE "public"."Chapter";

-- DropTable
DROP TABLE "public"."VideoLesson";

-- DropEnum
DROP TYPE "public"."FileType";

-- CreateTable
CREATE TABLE "public"."DailyUserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "DailyUserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Module" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "youtubeId" TEXT,
    "dropboxPath" TEXT,
    "storageKey" TEXT,
    "type" "public"."LessonType" NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "duration" INTEGER,
    "uploadedById" TEXT,
    "moduleId" TEXT NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Link" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moduleId" TEXT NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ForumPostLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ForumPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LessonProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalLessons" INTEGER NOT NULL DEFAULT 0,
    "quizzesCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalQuizzes" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DropboxToken" (
    "id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DropboxToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyUserActivity_userId_date_key" ON "public"."DailyUserActivity"("userId", "date");

-- CreateIndex
CREATE INDEX "Module_courseId_idx" ON "public"."Module"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseId_position_key" ON "public"."Module"("courseId", "position");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_idx" ON "public"."Lesson"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_position_key" ON "public"."Lesson"("moduleId", "position");

-- CreateIndex
CREATE INDEX "Link_moduleId_idx" ON "public"."Link"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Link_moduleId_position_key" ON "public"."Link"("moduleId", "position");

-- CreateIndex
CREATE INDEX "ForumPostLike_postId_idx" ON "public"."ForumPostLike"("postId");

-- CreateIndex
CREATE INDEX "ForumPostLike_userId_idx" ON "public"."ForumPostLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumPostLike_postId_userId_key" ON "public"."ForumPostLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "LessonProgress_studentId_idx" ON "public"."LessonProgress"("studentId");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "public"."LessonProgress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_studentId_lessonId_key" ON "public"."LessonProgress"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "CourseProgress_studentId_idx" ON "public"."CourseProgress"("studentId");

-- CreateIndex
CREATE INDEX "CourseProgress_courseId_idx" ON "public"."CourseProgress"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseProgress_studentId_courseId_key" ON "public"."CourseProgress"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_moduleId_key" ON "public"."Quiz"("moduleId");

-- AddForeignKey
ALTER TABLE "public"."DailyUserActivity" ADD CONSTRAINT "DailyUserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Link" ADD CONSTRAINT "Link_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumReply" ADD CONSTRAINT "ForumReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumPostLike" ADD CONSTRAINT "ForumPostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumPostLike" ADD CONSTRAINT "ForumPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonProgress" ADD CONSTRAINT "LessonProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseProgress" ADD CONSTRAINT "CourseProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseProgress" ADD CONSTRAINT "CourseProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

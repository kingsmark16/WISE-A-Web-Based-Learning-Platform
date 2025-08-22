/*
  Warnings:

  - You are about to drop the `FacultyAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "public"."FileType" AS ENUM ('PDF', 'IMAGE', 'DOCUMENT', 'SPREADSHEET', 'PRESENTATION', 'ARCHIVE', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."FacultyAssignment" DROP CONSTRAINT "FacultyAssignment_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FacultyAssignment" DROP CONSTRAINT "FacultyAssignment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FacultyAssignment" DROP CONSTRAINT "FacultyAssignment_facultyId_fkey";

-- DropTable
DROP TABLE "public"."FacultyAssignment";

-- CreateTable
CREATE TABLE "public"."Chapter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VideoLesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "duration" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chapterId" TEXT NOT NULL,

    CONSTRAINT "VideoLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "timeLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chapterId" TEXT NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "options" TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizSubmission" (
    "id" TEXT NOT NULL,
    "score" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "studentId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "QuizSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizAnswer" (
    "id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" "public"."FileType" NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chapterId" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ForumPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "courseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ForumReply" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAnswer" BOOLEAN NOT NULL DEFAULT false,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "ForumReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseCompletion" (
    "id" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CourseCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Certificate" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateUrl" TEXT,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "completionId" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chapter_courseId_idx" ON "public"."Chapter"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_courseId_position_key" ON "public"."Chapter"("courseId", "position");

-- CreateIndex
CREATE INDEX "VideoLesson_chapterId_idx" ON "public"."VideoLesson"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoLesson_chapterId_position_key" ON "public"."VideoLesson"("chapterId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_chapterId_key" ON "public"."Quiz"("chapterId");

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_idx" ON "public"."QuizQuestion"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestion_quizId_position_key" ON "public"."QuizQuestion"("quizId", "position");

-- CreateIndex
CREATE INDEX "QuizSubmission_studentId_idx" ON "public"."QuizSubmission"("studentId");

-- CreateIndex
CREATE INDEX "QuizSubmission_quizId_idx" ON "public"."QuizSubmission"("quizId");

-- CreateIndex
CREATE INDEX "QuizAnswer_submissionId_idx" ON "public"."QuizAnswer"("submissionId");

-- CreateIndex
CREATE INDEX "QuizAnswer_questionId_idx" ON "public"."QuizAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAnswer_submissionId_questionId_key" ON "public"."QuizAnswer"("submissionId", "questionId");

-- CreateIndex
CREATE INDEX "Attachment_chapterId_idx" ON "public"."Attachment"("chapterId");

-- CreateIndex
CREATE INDEX "ForumPost_courseId_idx" ON "public"."ForumPost"("courseId");

-- CreateIndex
CREATE INDEX "ForumPost_authorId_idx" ON "public"."ForumPost"("authorId");

-- CreateIndex
CREATE INDEX "ForumPost_createdAt_idx" ON "public"."ForumPost"("createdAt");

-- CreateIndex
CREATE INDEX "ForumReply_postId_idx" ON "public"."ForumReply"("postId");

-- CreateIndex
CREATE INDEX "ForumReply_authorId_idx" ON "public"."ForumReply"("authorId");

-- CreateIndex
CREATE INDEX "ForumReply_createdAt_idx" ON "public"."ForumReply"("createdAt");

-- CreateIndex
CREATE INDEX "CourseCompletion_userId_idx" ON "public"."CourseCompletion"("userId");

-- CreateIndex
CREATE INDEX "CourseCompletion_courseId_idx" ON "public"."CourseCompletion"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCompletion_userId_courseId_key" ON "public"."CourseCompletion"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "public"."Certificate"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_completionId_key" ON "public"."Certificate"("completionId");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "public"."Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_courseId_idx" ON "public"."Certificate"("courseId");

-- CreateIndex
CREATE INDEX "Certificate_certificateNumber_idx" ON "public"."Certificate"("certificateNumber");

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoLesson" ADD CONSTRAINT "VideoLesson_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizSubmission" ADD CONSTRAINT "QuizSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizSubmission" ADD CONSTRAINT "QuizSubmission_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAnswer" ADD CONSTRAINT "QuizAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."QuizSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAnswer" ADD CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumPost" ADD CONSTRAINT "ForumPost_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumReply" ADD CONSTRAINT "ForumReply_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumReply" ADD CONSTRAINT "ForumReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseCompletion" ADD CONSTRAINT "CourseCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseCompletion" ADD CONSTRAINT "CourseCompletion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_completionId_fkey" FOREIGN KEY ("completionId") REFERENCES "public"."CourseCompletion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

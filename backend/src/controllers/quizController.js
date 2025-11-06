import prisma from "../lib/prisma.js";
import ProgressService from "../services/progress.service.js";

// Helper to hide correct answers for students
const sanitizeQuestionsForStudent = (questions) => {
  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: q.options,
    points: q.points,
    position: q.position,
  }));
};

export const createQuiz = async (req, res) => {
  try {
    const { moduleId, title, description, timeLimit, attemptLimit, questions } = req.body;

    if (!moduleId || !title) return res.status(400).json({ message: "moduleId and title are required" });

    // ensure module exists and get course for auth
    const module = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!module) return res.status(404).json({ message: "Module not found" });

    // Check if module already has a quiz
    const existingQuiz = await prisma.quiz.findUnique({ where: { moduleId } });
    if (existingQuiz) {
      return res.status(400).json({ message: "A quiz already exists for this module. Each module can only have one quiz." });
    }

    const auth = req.auth();
    const userId = auth.userId;

    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });

    if (!user) return res.status(401).json({ message: "User not found" });

    // Authorization: If faculty is assigned, only they can manage
    // If no faculty is assigned, only creator can manage
    const isAuthorized = (module.course.facultyId && user.id === module.course.facultyId) || 
                        (!module.course.facultyId && user.id === module.course.createdById);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to create quiz for this module" });
    }

    // Create quiz and questions in a transaction
    const quizId = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: { title, description, timeLimit: timeLimit || 0, attemptLimit: attemptLimit ?? null, moduleId },
      });

      if (Array.isArray(questions) && questions.length > 0) {
        const toCreate = questions.map((q, idx) => ({
          question: q.question,
          type: q.type,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          points: q.points ?? 1,
          position: q.position ?? (idx + 1),
          quizId: quiz.id,
        }));

        await tx.quizQuestion.createMany({ data: toCreate });
      }

      return quiz.id;
    });

    // Fetch the created quiz outside the transaction
    const created = await prisma.quiz.findUnique({ 
      where: { id: quizId }, 
      include: { questions: true } 
    });

    // Mark module as incomplete for all enrolled students if it was previously completed
    await ProgressService.markModuleIncompleteIfCompleted(moduleId);

    res.status(201).json({ message: 'Quiz created', quiz: created });
  } catch (error) {
    console.error('createQuiz error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, timeLimit, attemptLimit, questions } = req.body;

    if (!id) return res.status(400).json({ message: 'Quiz id is required' });

    const existing = await prisma.quiz.findUnique({ where: { id }, include: { module: { include: { course: true } }, questions: true } });
    if (!existing) return res.status(404).json({ message: 'Quiz not found' });

    const auth = req.auth();
    const userId = auth.userId;
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });

    if (!user) return res.status(401).json({ message: 'User not found' });

    // Check if user is course creator, assigned faculty, or admin
    const isAuthorized = (existing.module.course.facultyId && user.id === existing.module.course.facultyId) || 
                        (!existing.module.course.facultyId && user.id === existing.module.course.createdById);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this quiz' });
    }

    // Update basic fields and replace questions if provided
    let questionsChanged = false;
    
    await prisma.$transaction(async (tx) => {
      await tx.quiz.update({ where: { id }, data: { title, description, timeLimit, attemptLimit } });

      if (Array.isArray(questions)) {
        // Check if questions have actually changed
        questionsChanged = questions.length !== existing.questions.length ||
          questions.some((newQ, idx) => {
            const oldQ = existing.questions[idx];
            if (!oldQ) return true; // New question added
            return (
              newQ.question !== oldQ.question ||
              newQ.type !== oldQ.type ||
              JSON.stringify(newQ.options) !== JSON.stringify(oldQ.options) ||
              newQ.correctAnswer !== oldQ.correctAnswer ||
              (newQ.points ?? 1) !== (oldQ.points ?? 1)
            );
          });

        // Only delete submissions if questions have actually changed
        if (questionsChanged) {
          // First delete all answers associated with submissions
          const submissionsToDelete = await tx.quizSubmission.findMany({
            where: { quizId: id },
            select: { id: true }
          });
          
          for (const submission of submissionsToDelete) {
            await tx.quizAnswer.deleteMany({ where: { submissionId: submission.id } });
          }
          
          // Then delete all submissions
          await tx.quizSubmission.deleteMany({ where: { quizId: id } });
          
          // delete existing questions then create new
          await tx.quizQuestion.deleteMany({ where: { quizId: id } });
          const toCreate = questions.map((qq, idx) => ({
            question: qq.question,
            type: qq.type,
            options: qq.options || [],
            correctAnswer: qq.correctAnswer,
            points: qq.points ?? 1,
            position: qq.position ?? (idx + 1),
            quizId: id,
          }));
          if (toCreate.length > 0) await tx.quizQuestion.createMany({ data: toCreate });
        }
      }
    });

    // Fetch updated quiz outside the transaction
    const updated = await prisma.quiz.findUnique({ 
      where: { id }, 
      include: { questions: true } 
    });

    // If questions were changed, mark module as incomplete for all enrolled students
    if (questions && questionsChanged) {
      await ProgressService.markModuleIncompleteIfCompleted(existing.module.id);
    }

    res.status(200).json({ message: 'Quiz updated', quiz: updated });
  } catch (error) {
    console.error('updateQuiz error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Quiz id is required' });

    const existing = await prisma.quiz.findUnique({ where: { id }, include: { module: { include: { course: true } } } });
    if (!existing) return res.status(404).json({ message: 'Quiz not found' });

    const auth = req.auth();
    const userId = auth.userId;
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });

    if (!user) return res.status(401).json({ message: 'User not found' });

    // Check if user is course creator, assigned faculty, or admin
    const isAuthorized = (existing.module.course.facultyId && user.id === existing.module.course.facultyId) || 
                        (!existing.module.course.facultyId && user.id === existing.module.course.createdById);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    // Handle progress cleanup BEFORE deleting the quiz (so we can still query submissions)
    try {
      const progressCleanup = await ProgressService.handleQuizDeletion(id, existing.module.id);
      console.log("Quiz deletion progress cleanup completed:", {
        affectedStudents: progressCleanup.affectedStudents,
        updatedModuleProgressRecords: progressCleanup.updatedModuleProgressRecords
      });
    } catch (progressError) {
      console.warn("Warning: Quiz deletion progress cleanup failed:", progressError);
      // Don't fail the deletion, just log the warning
    }

    // Delete quiz and its questions (after progress cleanup)
    await prisma.$transaction(async (tx) => {
      await tx.quizQuestion.deleteMany({ where: { quizId: id } });
      await tx.quiz.delete({ where: { id } });
    });

    res.status(200).json({ message: 'Quiz deleted' });
  } catch (error) {
    console.error('deleteQuiz error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const publishQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Quiz id is required' });

    const auth = req.auth();
    const userId = auth.userId;
    const user = await prisma.user.findUnique({ 
      where: { clerkId: userId }, 
      select: { id: true, role: true } 
    });

    if (!user) return res.status(401).json({ message: 'User not found' });

    // Fetch quiz with minimal data for authorization check
    const quiz = await prisma.quiz.findUnique({ 
      where: { id },
      select: { 
        id: true,
        isPublished: true,
        module: { 
          select: { 
            course: { select: { createdById: true, facultyId: true } }
          }
        }
      }
    });

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Authorization: If faculty is assigned, only they can publish
    // If no faculty is assigned, only creator can publish
    const isAuthorized = (quiz.module.course.facultyId && user.id === quiz.module.course.facultyId) || 
                        (!quiz.module.course.facultyId && user.id === quiz.module.course.createdById);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to publish this quiz' });
    }

    // If unpublishing, close all active quiz sessions
    if (quiz.isPublished) {
      // When unpublishing, mark all ongoing submissions as ended
      // This cancels active sessions while preserving completed ones
      await prisma.quizSubmission.updateMany({
        where: {
          quizId: id,
          endedAt: null  // Only update submissions that are still ongoing
        },
        data: {
          endedAt: new Date()  // Mark as ended/cancelled
        }
      });
    }

    // Toggle publish state and return complete quiz data
    const updated = await prisma.quiz.update({
      where: { id },
      data: { isPublished: !quiz.isPublished },
      include: {
        questions: {
          orderBy: { position: 'asc' }
        }
      }
    });

    res.status(200).json({ 
      message: `Quiz ${updated.isPublished ? 'published' : 'unpublished'} successfully`, 
      quiz: updated 
    });
  } catch (error) {
    console.error('publishQuiz error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { id } = req.params; // quiz id
    if (!id) return res.status(400).json({ message: 'Quiz id is required' });

    const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: { orderBy: { position: 'asc' } }, module: true } });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // If student, hide correctAnswer in questions
    const auth = req.auth();
    const userId = auth.userId;
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });

    if (user && user.role === 'STUDENT') {
      const sanitized = { ...quiz, questions: sanitizeQuestionsForStudent(quiz.questions) };
      return res.status(200).json({ quiz: sanitized });
    }

    res.status(200).json({ quiz });
  } catch (error) {
    console.error('getQuiz error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Student starts a submission - create a QuizSubmission with startedAt
export const startSubmission = async (req, res) => {
  try {
    const { quizId } = req.body;
    if (!quizId) return res.status(400).json({ message: 'quizId is required' });

    const auth = req.auth();
    const userId = auth.userId;
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    // ensure quiz exists
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { questions: true } });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Enforce attempt limit if set (> 0). If attemptLimit is null/undefined => unlimited.
    if (typeof quiz.attemptLimit === 'number' && quiz.attemptLimit > 0) {
      const attempts = await prisma.quizSubmission.count({ where: { quizId, studentId: user.id } });
      if (attempts >= quiz.attemptLimit) {
        return res.status(403).json({ message: 'Attempt limit reached' });
      }
    }

    // create submission
    const submission = await prisma.quizSubmission.create({ data: { quizId, studentId: user.id } });

    // return quiz without correct answers
    const sanitizedQuiz = { ...quiz, questions: sanitizeQuestionsForStudent(quiz.questions) };
    res.status(201).json({ submissionId: submission.id, quiz: sanitizedQuiz, startedAt: submission.startedAt });
  } catch (error) {
    console.error('startSubmission error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Student submits answers: payload { submissionId, answers: [{ questionId, answer }, ...] }
export const submitAnswers = async (req, res) => {
  try {
    const { submissionId, answers } = req.body;
    if (!submissionId || !Array.isArray(answers)) return res.status(400).json({ message: 'submissionId and answers array are required' });

    const submission = await prisma.quizSubmission.findUnique({ where: { id: submissionId }, include: { quiz: { include: { questions: true } } } });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const auth = req.auth();
    const userId = auth.userId;
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    if (submission.studentId !== user.id) return res.status(403).json({ message: 'Not authorized to submit for this submission' });

  // Prevent double-submitting the same submission
  if (submission.endedAt) return res.status(400).json({ message: 'Submission already completed' });

    // Evaluate answers
    const questionMap = new Map(submission.quiz.questions.map((q) => [q.id, q]));
    let totalScore = 0;
    let totalPoints = 0;

    const answerRecords = answers.map((a) => {
      const q = questionMap.get(a.questionId);
      if (!q) return null;
      totalPoints += q.points ?? 1;
      const isCorrect = (() => {
        if (q.type === 'MULTIPLE_CHOICE' || q.type === 'ENUMERATION' || q.type === 'TRUE_FALSE') {
          // compare as strings
          return String(a.answer).trim() === String(q.correctAnswer).trim();
        }
        return false;
      })();
      if (isCorrect) totalScore += q.points ?? 1;

      return {
        answer: a.answer,
        isCorrect,
        submissionId,
        questionId: a.questionId,
      };
    }).filter(Boolean);

    // save answers and update submission
    await prisma.$transaction(async (tx) => {
      // create answer records
      for (const r of answerRecords) {
        await tx.quizAnswer.create({ data: r });
      }

      // Only store completion time, not score (will be calculated dynamically)
      await tx.quizSubmission.update({ where: { id: submissionId }, data: { endedAt: new Date() } });
    });

    // Calculate score based on current question points
    const currentTotalScore = answerRecords.reduce((score, record) => {
      if (record.isCorrect) {
        const question = questionMap.get(record.questionId);
        return score + (question?.points || 0);
      }
      return score;
    }, 0);

    const currentMaxScore = submission.quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    const percentage = currentMaxScore > 0 ? Math.round((currentTotalScore / currentMaxScore) * 100) : 0;

    res.status(200).json({ 
      message: 'Submitted', 
      score: currentTotalScore, 
      maxScore: currentMaxScore,
      percentage 
    });
  } catch (error) {
    console.error('submitAnswers error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSubmission = async (req, res) => {
  try {
    const { id } = req.params; // submission id
    if (!id) return res.status(400).json({ message: 'Submission id is required' });

    const submission = await prisma.quizSubmission.findUnique({ where: { id }, include: { answers: true, quiz: { include: { questions: true } }, student: true } });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const auth = req.auth();
    const userId = auth.userId;
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Only assigned faculty, creator (if no faculty assigned), or the student can view
    const quiz = submission.quiz;
    const module = await prisma.module.findUnique({ where: { id: quiz.moduleId }, include: { course: true } });

    const isFacultyOrCreator = (module.course.facultyId && user.id === module.course.facultyId) || 
                              (!module.course.facultyId && user.id === module.course.createdById);
    
    const isAuthorized = isFacultyOrCreator || user.id === submission.studentId;
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.status(200).json({ submission });
  } catch (error) {
    console.error('getSubmission error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

import { Router } from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  getQuiz,
  startSubmission,
  submitAnswers,
  getSubmission,
} from "../controllers/quizController.js";

const router = Router();

// Admin/Faculty only for creating/updating/deleting quizzes
router.post('/', createQuiz);
router.patch('/:id', requireRole(['ADMIN','FACULTY']), updateQuiz);
router.patch('/:id/publish', requireRole(['ADMIN','FACULTY']), publishQuiz);
router.delete('/:id', requireRole(['ADMIN','FACULTY']), deleteQuiz);

// Anyone authenticated can get quiz (students will have answers hidden by controller)
router.get('/:id', requireRole(['ADMIN','FACULTY','STUDENT']), getQuiz);

// Submission endpoints - students
router.post('/submission/start', startSubmission);
router.post('/submission/submit', requireRole(['STUDENT']), submitAnswers);
router.get('/submission/:id', requireRole(['ADMIN','FACULTY','STUDENT']), getSubmission);

export default router;

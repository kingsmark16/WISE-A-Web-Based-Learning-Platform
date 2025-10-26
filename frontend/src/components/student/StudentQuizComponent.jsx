import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useSubmitStudentQuiz } from '@/hooks/student/useStudentQuiz';

/**
 * Individual question component
 */
const QuizQuestion = ({ question, questionIndex, answer, onAnswerChange }) => {
  const preventCopy = (e) => {
    e.preventDefault();
    return false;
  };

  const preventContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleOptionSelect = (optionValue) => {
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
      onAnswerChange(question.id, optionValue);
    }
  };

  const handleTextChange = (value) => {
    if (question.type === 'ENUMERATION') {
      onAnswerChange(question.id, value);
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <RadioGroup
            value={answer || ''}
            onValueChange={handleOptionSelect}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`q${question.id}-opt${index}`} />
                <Label
                  htmlFor={`q${question.id}-opt${index}`}
                  className="flex-1 cursor-pointer text-sm select-none"
                  onCopy={preventCopy}
                  onCut={preventCopy}
                  onPaste={preventCopy}
                  onContextMenu={preventContextMenu}
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'TRUE_FALSE':
        return (
          <RadioGroup
            value={answer || ''}
            onValueChange={handleOptionSelect}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`q${question.id}-true`} />
              <Label htmlFor={`q${question.id}-true`} className="flex-1 cursor-pointer text-sm select-none" onCopy={preventCopy} onCut={preventCopy} onPaste={preventCopy} onContextMenu={preventContextMenu}>
                True
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`q${question.id}-false`} />
              <Label htmlFor={`q${question.id}-false`} className="flex-1 cursor-pointer text-sm select-none" onCopy={preventCopy} onCut={preventCopy} onPaste={preventCopy} onContextMenu={preventContextMenu}>
                False
              </Label>
            </div>
          </RadioGroup>
        );

      case 'ENUMERATION':
        return (
          <Textarea
            value={answer || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter your answer here..."
            className="min-h-[100px]"
          />
        );

      default:
        return <p className="text-sm text-muted-foreground">Unsupported question type: {question.type}</p>;
    }
  };

  return (
    <Card className="mb-4" onContextMenu={preventContextMenu}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base mb-2 select-none" onCopy={preventCopy} onCut={preventCopy} onPaste={preventCopy} onContextMenu={preventContextMenu}>
              Question {questionIndex + 1}
              {question.points && (
                <span className="text-sm font-normal text-muted-foreground ml-2 select-none" onCopy={preventCopy} onCut={preventCopy} onPaste={preventCopy} onContextMenu={preventContextMenu}>
                  ({question.points} point{question.points !== 1 ? 's' : ''})
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-foreground select-none" onCopy={preventCopy} onCut={preventCopy} onPaste={preventCopy} onContextMenu={preventContextMenu}>{question.question}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent onContextMenu={preventContextMenu}>
        {renderQuestionInput()}
      </CardContent>
    </Card>
  );
};

/**
 * Main quiz component - displays questions and handles quiz logic
 */
const StudentQuizComponent = ({
  quiz,
  courseId,
  moduleId,
  onQuizComplete,
  onQuizCancel
}) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // TanStack Query mutation
  const submitQuizMutation = useSubmitStudentQuiz();

  // Generate a unique submission ID locally (kept for reference/logging)
  const submissionIdRef = useRef(null);
  if (!submissionIdRef.current) {
    submissionIdRef.current = `draft_${quiz.id}_${Date.now()}`;
  }

  // Set quiz start time when component mounts
  useEffect(() => {
    setQuizStartTime(new Date());
  }, []);

  // Save answers to localStorage as user progresses
  useEffect(() => {
    const draftKey = `quiz_draft_${quiz.id}`;
    localStorage.setItem(draftKey, JSON.stringify(answers));
  }, [answers, quiz.id]);

  const handleSubmitQuiz = useCallback(async (isAutoSubmit = false) => {
    // Prevent multiple simultaneous submissions
    if (isSubmitting || hasAutoSubmitted) return;
    setIsSubmitting(true);

    // If auto-submitting due to time limit, fill unanswered questions with empty answers
    let finalAnswers = { ...answers };
    
    if (isAutoSubmit) {
      // Set autosubmitted flag to prevent double submissions
      setHasAutoSubmitted(true);
      
      quiz.questions.forEach((question) => {
        const answer = finalAnswers[question.id];
        // Fill unanswered questions with empty string (will score 0)
        if (answer === undefined || answer === null || answer === '') {
          finalAnswers[question.id] = '';
        }
      });
    } else {
      // Validate that all questions are answered (only for manual submit)
      const unansweredQuestions = [];
      quiz.questions.forEach((question, index) => {
        const answer = answers[question.id];
        // Check if answer exists and is not empty
        if (answer === undefined || answer === null || answer === '') {
          unansweredQuestions.push(index + 1);
        }
      });

      if (unansweredQuestions.length > 0) {
        setValidationError(`Please answer all questions before submitting. Unanswered questions: ${unansweredQuestions.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Clear any previous validation error
      setValidationError(null);
    }

    try {
      // Convert answers object to array format expected by API
      const answersArray = Object.entries(finalAnswers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const result = await submitQuizMutation.mutateAsync({
        answers: answersArray,
        courseId,
        moduleId,
        quizId: quiz.id,
        startedAt: quizStartTime
      });

      // Clear localStorage draft after successful submission
      const draftKey = `quiz_draft_${quiz.id}`;
      localStorage.removeItem(draftKey);

      onQuizComplete(result);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsSubmitting(false); // Reset on error
      // Error is handled by the mutation
    }
  }, [answers, courseId, moduleId, quiz, quizStartTime, submitQuizMutation, onQuizComplete, isSubmitting, hasAutoSubmitted]);

  // Use ref to store the latest handleSubmitQuiz function
  const handleSubmitQuizRef = useRef(handleSubmitQuiz);
  useEffect(() => {
    handleSubmitQuizRef.current = handleSubmitQuiz;
  }, [handleSubmitQuiz]);

  // Initialize timer if quiz has time limit
  useEffect(() => {
    if (quiz?.timeLimit && quiz.timeLimit > 0 && !hasAutoSubmitted) {
      const timeLimitMs = quiz.timeLimit * 1000; // timeLimit is already in seconds, convert to milliseconds
      const startTime = Date.now();
      const endTime = startTime + timeLimitMs;
      
      setTimeRemaining(timeLimitMs);

      // Update display based on actual elapsed time
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
          // Immediately stop and submit when time is exactly up
          clearInterval(timer);
          setTimeRemaining(0);
          setHasAutoSubmitted(true);
          handleSubmitQuizRef.current(true);
        } else {
          setTimeRemaining(remaining);
        }
      }, 100); // More frequent updates for accuracy

      return () => {
        clearInterval(timer);
      };
    } else {
      setTimeRemaining(null);
    }
  }, [quiz?.timeLimit, hasAutoSubmitted]); // Only depend on timeLimit to prevent re-initialization

  const handleAnswerChange = useCallback((questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return "0:00";
    const totalSeconds = Math.ceil(milliseconds / 1000); // Round up for better UX
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 0;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  if (!quiz || !currentQuestion) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading quiz...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className={`text-sm font-mono ${timeRemaining < 60000 ? 'text-red-600' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              <Button variant="outline" onClick={onQuizCancel}>
                Cancel Quiz
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{answeredQuestions} of {totalQuestions} answered</span>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardContent>
      </Card>

      {/* Current Question */}
      <QuizQuestion
        question={currentQuestion}
        questionIndex={currentQuestionIndex}
        answer={answers[currentQuestion.id]}
        onAnswerChange={handleAnswerChange}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {!isLastQuestion ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={submitQuizMutation.isPending || isSubmitting}
            >
              {submitQuizMutation.isPending || isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Time Warning */}
      {timeRemaining !== null && timeRemaining < 60000 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Less than 1 minute remaining! Please submit your answers soon.
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Error */}
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default StudentQuizComponent;
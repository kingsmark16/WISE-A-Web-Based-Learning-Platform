import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle2, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useSubmitStudentQuiz } from '@/hooks/student/useStudentQuiz';

/**
 * Individual question component with modern design
 */
const QuizQuestion = ({ question, questionIndex, answer, onAnswerChange }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [questionIndex]);

  const preventCopy = (e) => {
    e.preventDefault();
    return false;
  };

  const preventContextMenu = (e) => {
    e.preventDefault();
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
            className="space-y-2.5"
          >
            {question.options?.map((option, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-3 rounded-lg border-2 border-muted hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
              >
                <RadioGroupItem 
                  value={option} 
                  id={`q${question.id}-opt${index}`}
                  className={answer === option ? 'ring-2 ring-primary' : ''}
                />
                <Label
                  htmlFor={`q${question.id}-opt${index}`}
                  className="flex-1 cursor-pointer text-sm font-medium text-foreground select-none group-hover:text-primary transition-colors"
                  onCopy={preventCopy}
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
            className="space-y-2.5"
          >
            {[
              { value: 'true', label: 'True' },
              { value: 'false', label: 'False' }
            ].map(({ value, label }) => (
              <div 
                key={value}
                className="flex items-center space-x-3 p-3 rounded-lg border-2 border-muted hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
              >
                <RadioGroupItem 
                  value={value} 
                  id={`q${question.id}-${value}`}
                  className={answer === value ? 'ring-2 ring-primary' : ''}
                />
                <Label 
                  htmlFor={`q${question.id}-${value}`} 
                  className="flex-1 cursor-pointer text-sm font-medium text-foreground select-none group-hover:text-primary transition-colors"
                  onCopy={preventCopy}
                  onContextMenu={preventContextMenu}
                >
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'ENUMERATION':
        return (
          <Textarea
            value={answer || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter your answer here..."
            className="min-h-[120px] resize-none focus:ring-2 focus:ring-primary border-2"
          />
        );

      default:
        return <p className="text-sm text-muted-foreground">Unsupported question type: {question.type}</p>;
    }
  };

  return (
    <Card 
      className={`overflow-hidden border-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
        isAnimating ? 'opacity-50' : 'opacity-100'
      }`}
      onContextMenu={preventContextMenu}
    >
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-foreground select-none">
                Question {questionIndex + 1}
                {question.points && (
                  <span className="text-sm font-normal text-primary ml-2 select-none">
                    +{question.points} point{question.points !== 1 ? 's' : ''}
                  </span>
                )}
              </CardTitle>
            </div>
          </div>
          <p className="text-base text-foreground leading-relaxed select-none font-medium">
            {question.question}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4" onContextMenu={preventContextMenu}>
        {renderQuestionInput()}
      </CardContent>
    </Card>
  );
};

/**
 * Main quiz component with modern design and animations
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

  const submitQuizMutation = useSubmitStudentQuiz();
  const submissionIdRef = useRef(null);
  if (!submissionIdRef.current) {
    submissionIdRef.current = `draft_${quiz.id}_${Date.now()}`;
  }

  useEffect(() => {
    setQuizStartTime(new Date());
  }, []);

  useEffect(() => {
    const draftKey = `quiz_draft_${quiz.id}`;
    localStorage.setItem(draftKey, JSON.stringify(answers));
  }, [answers, quiz.id]);

  const handleSubmitQuiz = useCallback(async (isAutoSubmit = false) => {
    if (isSubmitting || hasAutoSubmitted) return;
    setIsSubmitting(true);

    let finalAnswers = { ...answers };
    
    if (isAutoSubmit) {
      setHasAutoSubmitted(true);
      quiz.questions.forEach((question) => {
        const answer = finalAnswers[question.id];
        if (answer === undefined || answer === null || answer === '') {
          finalAnswers[question.id] = '';
        }
      });
    } else {
      const unansweredQuestions = [];
      quiz.questions.forEach((question, index) => {
        const answer = answers[question.id];
        if (answer === undefined || answer === null || answer === '') {
          unansweredQuestions.push(index + 1);
        }
      });

      if (unansweredQuestions.length > 0) {
        setValidationError(`Please answer all questions before submitting. Unanswered: Q${unansweredQuestions.join(', Q')}`);
        setIsSubmitting(false);
        return;
      }

      setValidationError(null);
    }

    try {
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

      const draftKey = `quiz_draft_${quiz.id}`;
      localStorage.removeItem(draftKey);

      onQuizComplete(result);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsSubmitting(false);
    }
  }, [answers, courseId, moduleId, quiz, quizStartTime, submitQuizMutation, onQuizComplete, isSubmitting, hasAutoSubmitted]);

  const handleSubmitQuizRef = useRef(handleSubmitQuiz);
  useEffect(() => {
    handleSubmitQuizRef.current = handleSubmitQuiz;
  }, [handleSubmitQuiz]);

  useEffect(() => {
    if (quiz?.timeLimit && quiz.timeLimit > 0 && !hasAutoSubmitted) {
      const timeLimitMs = quiz.timeLimit * 1000;
      const startTime = Date.now();
      const endTime = startTime + timeLimitMs;
      
      setTimeRemaining(timeLimitMs);

      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
          clearInterval(timer);
          setTimeRemaining(0);
          setHasAutoSubmitted(true);
          handleSubmitQuizRef.current(true);
        } else {
          setTimeRemaining(remaining);
        }
      }, 100);

      return () => {
        clearInterval(timer);
      };
    } else {
      setTimeRemaining(null);
    }
  }, [quiz?.timeLimit, hasAutoSubmitted]);

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
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 0;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isTimeWarning = timeRemaining !== null && timeRemaining < 60000;

  if (!quiz || !currentQuestion) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
        <span className="text-lg font-medium">Loading quiz...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header - Enhanced */}
      <Card className="border-2 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-transparent" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-foreground truncate">
                {quiz.title}
              </CardTitle>
              {quiz.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {quiz.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm font-bold transition-all duration-300 ${
                  isTimeWarning 
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  <Clock className="h-4 w-4" />
                  {formatTime(timeRemaining)}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={onQuizCancel}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                Exit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">
              Question <span className="text-primary font-bold">{currentQuestionIndex + 1}</span> of {totalQuestions}
            </span>
            <span className="text-muted-foreground">
              Answered: <span className="text-primary font-bold">{answeredQuestions}</span>/{totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Current Question */}
      <div key={currentQuestionIndex}>
        <QuizQuestion
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          answer={answers[currentQuestion.id]}
          onAnswerChange={handleAnswerChange}
        />
      </div>

      {/* Navigation - Enhanced with Icons */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="gap-2"
          size="lg"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-xs font-medium text-muted-foreground text-center">
          {currentQuestionIndex + 1} / {totalQuestions}
        </div>

        {!isLastQuestion ? (
          <Button 
            onClick={handleNext}
            className="gap-2 ml-auto"
            size="lg"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => handleSubmitQuiz(false)}
            disabled={submitQuizMutation.isPending || isSubmitting}
            className="ml-auto gap-2 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {submitQuizMutation.isPending || isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Submit Quiz
              </>
            )}
          </Button>
        )}
      </div>

      {/* Time Warning - Animated */}
      {isTimeWarning && (
        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 animate-in slide-in-from-top">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 animate-bounce" />
          <AlertDescription className="text-red-700 dark:text-red-200 font-medium">
            ⚠️ Less than 1 minute remaining! Your answers will auto-submit when time expires.
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Error - Animated */}
      {validationError && (
        <Alert variant="destructive" className="animate-in slide-in-from-bottom">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {validationError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default StudentQuizComponent;
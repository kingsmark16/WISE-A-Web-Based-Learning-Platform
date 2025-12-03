import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  FileText,
  Circle,
  CheckCircle,
  Timer
} from 'lucide-react';
import { useSubmitStudentQuiz } from '@/hooks/student/useStudentQuiz';
import { toast } from 'react-toastify';
import Confetti from './Confetti';

// Utility function to join classNames
const cn = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Individual question component with modern, interactive design (No Shadcn)
 */
const QuizQuestion = ({ question, questionIndex, answer, onAnswerChange }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 400);
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
    if (question.type === 'IDENTIFICATION') {
      onAnswerChange(question.id, value);
    }
  };

  const isAnswered = answer !== undefined && answer !== null && answer !== '';

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE': {
        return (
          <div className="space-y-1.5 mx-auto w-full max-w-full h-full overflow-y-auto overflow-x-hidden">
            {question.options?.map((option, index) => {
              const isSelected = answer === option;
              // Handle more than 26 options (A-Z then use numbers)
              const optionLabel = index < 26 
                ? String.fromCharCode(65 + index) 
                : `[${index + 1}]`;
              
              return (
                <div 
                  key={index} 
                  className={cn(
                    "group relative flex items-start gap-2 p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                    isSelected 
                      ? "border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-md shadow-cyan-500/30" 
                      : "border-cyan-500/30 hover:border-cyan-400/60 bg-slate-800/50 hover:bg-slate-800/80 hover:shadow-sm hover:shadow-cyan-500/20"
                  )}
                  onClick={() => handleOptionSelect(option)}
                >
                  {/* Option Letter Badge - Smaller */}
                  <div className={cn(
                    "flex-shrink-0 w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-all duration-300 mt-0.5",
                    isSelected 
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/50" 
                      : "bg-gradient-to-br from-slate-700 to-slate-600 text-cyan-300 group-hover:from-cyan-600/40 group-hover:to-blue-600/40"
                  )}>
                    {optionLabel}
                  </div>

                  {/* Option Text - Flexible container */}
                  <label
                    htmlFor={`q${question.id}-opt${index}`}
                    className="flex-1 cursor-pointer select-none min-w-0"
                    onCopy={preventCopy}
                    onContextMenu={preventContextMenu}
                  >
                    <span className={cn(
                      "text-base font-medium leading-relaxed transition-colors block break-words",
                      isSelected ? "text-cyan-200 font-semibold" : "text-gray-300 group-hover:text-cyan-200"
                    )}>
                      {option}
                    </span>
                  </label>

                  {/* Radio Input */}
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(option)}
                    id={`q${question.id}-opt${index}`}
                    className="w-4 h-4 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer flex-shrink-0 accent-cyan-500 mt-0.5"
                  />

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center shadow-md shadow-cyan-500/50">
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'TRUE_FALSE':
        return (
          <div className="grid grid-cols-2 gap-3 mx-auto max-w-xl">
            {[
              { value: 'true', label: 'True' },
              { value: 'false', label: 'False' }
            ].map(({ value, label }) => {
              const isSelected = answer === value;
              const Icon = value === 'true' ? CheckCircle : Circle;
              
              return (
                <div 
                  key={value}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 cursor-pointer",
                    isSelected 
                      ? "border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/30" 
                      : "border-cyan-500/30 hover:border-cyan-400/60 bg-slate-800/50 hover:bg-slate-800/80 hover:shadow-md hover:shadow-cyan-500/20 hover:scale-102"
                  )}
                  onClick={() => handleOptionSelect(value)}
                >
                  <Icon className={cn(
                    "h-12 w-12 sm:h-16 sm:w-16 mb-2 transition-all duration-300",
                    isSelected 
                      ? "text-cyan-400 drop-shadow-lg" 
                      : "text-slate-500 group-hover:text-cyan-400"
                  )} />
                  
                  <label 
                    htmlFor={`q${question.id}-${value}`} 
                    className={cn(
                      "cursor-pointer text-xl sm:text-2xl font-bold select-none transition-colors mb-2 font-mono",
                      isSelected ? "text-cyan-300" : "text-gray-400 group-hover:text-cyan-300"
                    )}
                    onCopy={preventCopy}
                    onContextMenu={preventContextMenu}
                  >
                    {label}
                  </label>

                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={value}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(value)}
                    id={`q${question.id}-${value}`}
                    className="w-4 h-4 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer accent-cyan-500"
                  />

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-6 sm:w-8 h-6 sm:h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'IDENTIFICATION':
        return (
          <div className="space-y-2 sm:space-y-3 mx-auto max-w-3xl">
            <div className="relative">
              <textarea
                value={answer || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type your answer here... Be specific and clear."
                className="w-full min-h-[100px] sm:min-h-[140px] resize-none p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-cyan-500/40 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 text-base sm:text-lg leading-relaxed bg-slate-800 text-cyan-100 transition-all placeholder:text-slate-600 font-mono"
              />
              {answer && (
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 py-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 rounded text-xs font-bold border border-cyan-400/50">
                  {answer.length}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
              <FileText className="h-3 w-3" />
              <span>Be specific and detailed</span>
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-gray-500">Unsupported question type: {question.type}</p>;
    }
  };

  return (
    <div 
      className={cn(
        "bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900/50 border border-cyan-500/40 rounded-lg sm:rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden transition-all duration-300 flex flex-col w-full h-full",
        isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}
      onContextMenu={preventContextMenu}
    >
      {/* Question Header - Scrollable Section */}
      <div className="flex-shrink-0 overflow-y-auto max-h-[35%]">
        <div className="bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-indigo-600/30 px-3 sm:px-4 py-2 sm:py-3 border-b border-cyan-500/40">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-cyan-500/50 flex-shrink-0 mt-0.5">
                {questionIndex + 1}
              </div>
              {question.points && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/50 font-mono flex-shrink-0">
                  {question.points} {question.points === 1 ? 'point' : 'points'}
                </span>
              )}
            </div>
            {isAnswered && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600/40 to-teal-600/40 text-emerald-300 border border-emerald-400/60 flex-shrink-0">
                <CheckCircle2 className="h-2.5 w-2.5" />
                <span className="text-xs font-bold font-mono whitespace-nowrap hidden sm:inline">✓</span>
              </div>
            )}
          </div>
          
          {/* Question Text - Can scroll if very long */}
          <p className="text-sm sm:text-base text-cyan-100 font-medium leading-relaxed select-none font-mono break-words hyphens-auto">
            {question.question}
          </p>
        </div>
      </div>

      {/* Question Options/Input - Fixed, Non-scrollable */}
      <div className="flex-1 px-2 sm:px-4 pt-4 sm:pt-6 pb-0.5 min-h-0 overflow-hidden flex items-center justify-center w-full">
        <div className="w-full">
          {renderQuestionInput()}
        </div>
      </div>
    </div>
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
  onConfettiChange
}) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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
        const errorMessage = `Please answer all questions before submitting. Unanswered: Q${unansweredQuestions.join(', Q')}`;
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const answersArray = Object.entries(finalAnswers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      // Trigger confetti animation
      setShowConfetti(true);
      if (onConfettiChange) onConfettiChange(true);

      const result = await submitQuizMutation.mutateAsync({
        answers: answersArray,
        courseId,
        moduleId,
        quizId: quiz.id,
        startedAt: quizStartTime
      });

      const draftKey = `quiz_draft_${quiz.id}`;
      localStorage.removeItem(draftKey);

      // Wait for confetti animation to complete before showing results
      setTimeout(() => {
        onQuizComplete(result);
      }, 3000);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit quiz';
      toast.error(errorMessage);
      setIsSubmitting(false);
      setShowConfetti(false);
      if (onConfettiChange) onConfettiChange(false);
    }
  }, [answers, courseId, moduleId, quiz, quizStartTime, submitQuizMutation, onQuizComplete, isSubmitting, hasAutoSubmitted, onConfettiChange]);

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
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="space-y-2 text-center">
          <p className="text-lg font-semibold">Loading quiz...</p>
          <p className="text-sm text-muted-foreground">Please wait while we prepare your questions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950 relative">
      {/* Confetti Animation - Inside Modal */}
      <Confetti 
        active={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />

      {/* Top Progress Bar - Full Width */}
      <div className="flex-shrink-0 bg-gradient-to-r from-cyan-950 to-blue-950 shadow-md relative z-10 border-b border-cyan-500/30">
        <div className="relative h-2 bg-slate-900/50 border-b border-cyan-500/20">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 transition-all duration-500 ease-out shadow-lg shadow-cyan-500/50"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-cyan-300/40 animate-pulse" />
          </div>
        </div>
        
        {/* Header Info Bar */}
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 rounded-full">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold text-cyan-300 font-mono">
                {answeredQuestions}/{totalQuestions} ANSWERED
              </span>
            </div>
            {timeRemaining !== null && (
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm font-bold transition-all border",
                isTimeWarning 
                  ? "bg-gradient-to-r from-red-600/40 to-orange-600/40 border-red-500/60 text-red-300 animate-pulse" 
                  : "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-300"
              )}>
                <Timer className="h-4 w-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-cyan-300/70 font-mono">
            {Math.round(progress)}% PROGRESS
          </div>
        </div>
      </div>

      {/* Time Warning Banner */}
      {isTimeWarning && (
        <div className="flex-shrink-0 bg-gradient-to-r from-red-700/80 via-orange-700/80 to-red-700/80 text-white px-4 py-2 flex items-center justify-center gap-2 animate-pulse border-b border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-bold font-mono">TIME_ALERT: Less than 1 minute remaining!</span>
        </div>
      )}

      {/* Main Content Area - Question Card */}
      <div className="flex-1 overflow-hidden p-2 sm:p-4 bg-gradient-to-br from-slate-950/50 via-slate-900/30 to-cyan-950/30 min-h-0 flex items-center justify-center">
        <div className="w-full max-w-2xl h-full flex flex-col">
          <QuizQuestion
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            answer={answers[currentQuestion.id]}
            onAnswerChange={handleAnswerChange}
          />
        </div>
      </div>

      {/* Bottom Navigation & Pagination */}
      <div className="flex-shrink-0 bg-gradient-to-r from-cyan-950 to-blue-950 border-t-2 border-cyan-500/30 shadow-lg">
        <div className="px-3 sm:px-6 py-3 sm:py-4 max-h-48 overflow-y-auto">
          {/* Pagination Dots - Scrollable Grid */}
          <div className="flex items-center justify-center gap-1 mb-4 flex-wrap">
            {quiz.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
              const isCurrent = idx === currentQuestionIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={cn(
                    "relative transition-all duration-300 rounded-md font-bold font-mono text-sm flex-shrink-0",
                    isCurrent 
                      ? "w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/50 scale-110 ring-4 ring-cyan-500/30" 
                      : "w-8 h-8",
                    !isCurrent && isAnswered 
                      ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm hover:scale-105" 
                      : !isCurrent && "bg-slate-700 text-cyan-300 hover:bg-slate-600 hover:scale-105 border border-cyan-500/30"
                  )}
                  title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : ''}`}
                >
                  {idx + 1}
                  {!isCurrent && isAnswered && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="h-1.5 w-1.5 text-emerald-900" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 font-mono text-xs sm:text-sm",
                currentQuestionIndex === 0
                  ? "opacity-40 cursor-not-allowed bg-slate-700 text-slate-400"
                  : "bg-slate-700 text-cyan-300 hover:bg-slate-600 active:scale-95 shadow-md hover:shadow-lg hover:shadow-cyan-500/20 border border-cyan-500/30"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-cyan-300 font-mono whitespace-nowrap">
              <span className="hidden sm:inline">Q</span>
              <span className="px-2 sm:px-3 py-1 sm:py-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 rounded border border-cyan-400/50">
                {currentQuestionIndex + 1}/{totalQuestions}
              </span>
            </div>

            {!isLastQuestion && answeredQuestions < totalQuestions ? (
              <button 
                onClick={handleNext}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md hover:shadow-xl hover:shadow-cyan-500/40 active:scale-95 transition-all duration-200 font-mono text-xs sm:text-sm border border-cyan-400/50"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmitQuiz(false)}
                disabled={submitQuizMutation.isPending || isSubmitting}
                className={cn(
                  "flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 transition-all duration-200 font-mono text-xs sm:text-sm border border-emerald-400/50",
                  (submitQuizMutation.isPending || isSubmitting) && "opacity-50 cursor-not-allowed"
                )}
              >
                {submitQuizMutation.isPending || isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">SUBMITTING...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>SUBMIT</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizComponent;
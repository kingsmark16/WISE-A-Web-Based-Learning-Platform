import React, { memo, useState, useEffect } from 'react';
import { HelpCircle, Loader2, CheckCircle2, Clock, Zap, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useStartStudentQuiz } from '@/hooks/student/useStudentQuiz';
import StudentQuizComponent from '@/components/student/StudentQuizComponent';
import StudentQuizHistory from '@/components/student/StudentQuizHistory';
import QuizModal from '@/components/student/QuizModal';
import { toast } from 'react-toastify';

/**
 * Quiz component - memoized for performance
 * Displays quiz information and allows students to start the quiz
 */
const StudentQuizSection = memo(({ quiz, courseId, moduleId, isLoading = false }) => {
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // TanStack Query hooks
  const startQuizMutation = useStartStudentQuiz();

  // Reset state when quiz changes or component mounts
  useEffect(() => {
    setIsQuizActive(false);
    setQuizData(null);
    setShowConfetti(false);
  }, [quiz?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading quiz...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <h3 className="text-sm font-semibold text-foreground">Quiz</h3>
        </div>
        <div className="text-center text-sm text-muted-foreground rounded-lg">
          <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No quiz available for this module yet.</p>
        </div>
      </div>
    );
  }

  const formatTime = (minutes) => {
    if (!minutes) return null;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  const handleStartQuiz = async () => {
    try {
      const result = await startQuizMutation.mutateAsync({
        quizId: quiz.id,
        courseId,
        moduleId
      });

      setQuizData(result.quiz);
      setIsQuizActive(true);
    } catch (error) {
      // Show error in toast and ensure quiz is not active
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to start quiz';
      toast.error(errorMessage);
      setIsQuizActive(false);
      setQuizData(null);
      console.error('Failed to start quiz:', error);
    }
  };

  const handleQuizComplete = (result) => {
    setIsQuizActive(false);
    setQuizData(null);
    
    // Show success message with score
    if (result?.submission) {
      const { score, totalPoints } = result.submission;
      const percentage = totalPoints > 0 ? ((score / totalPoints) * 100).toFixed(1) : 0;
      toast.success(`Quiz submitted successfully! Score: ${score}/${totalPoints} (${percentage}%)`, {
        autoClose: 5000
      });
    } else {
      toast.success('Quiz submitted successfully!');
    }
  };

  const questionCount = quiz._count?.questions || 0;
  const timeLimit = quiz.timeLimit ? formatTime(Math.floor(quiz.timeLimit / 60)) : null;
  const isPublished = quiz.isPublished;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-primary/10">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Quiz</h3>
          <p className="text-xs text-muted-foreground">Test your knowledge</p>
        </div>
      </div>

      {/* Not Published Alert */}
      {!isPublished && (
        <Alert className="bg-muted/50 border-muted py-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <AlertDescription className="text-sm text-muted-foreground">
            This quiz will be available soon
          </AlertDescription>
        </Alert>
      )}

      {/* Quiz Card */}
      <Card className={`transition-all duration-200 ${
        isPublished 
          ? 'hover:shadow-lg border-primary/20 hover:border-primary/40' 
          : 'opacity-60 border-muted'
      }`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground line-clamp-1">
            {quiz.title || 'Module Quiz'}
          </CardTitle>
          {quiz.description && (
            <CardDescription className="text-sm line-clamp-2 mt-1">
              {quiz.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Questions */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg bg-secondary/50 border border-secondary hover:bg-secondary transition-colors cursor-help">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Questions</p>
                    <p className="text-xl font-bold text-foreground">{questionCount}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  Total questions in this quiz
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Time Limit */}
            {timeLimit && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-secondary hover:bg-secondary transition-colors cursor-help">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Time</p>
                      <p className="text-xl font-bold text-foreground">{timeLimit}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    Maximum time allowed
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Attempts */}
            {quiz.attemptLimit && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-secondary hover:bg-secondary transition-colors cursor-help">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Attempts</p>
                      <p className="text-xl font-bold text-foreground">{quiz.attemptLimit}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    Max retake attempts
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Start Button */}
          <Button
            className="w-full h-10 text-base"
            disabled={!isPublished || isLoading || startQuizMutation.isPending || isQuizActive}
            onClick={handleStartQuiz}
          >
            {startQuizMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Start Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Quiz Component in Modal */}
      <QuizModal
        isOpen={isQuizActive && quizData !== null}
        onClose={() => {
          // Prevent closing while submitting
          if (!quizData) return;
          
          const confirmClose = window.confirm(
            'Are you sure you want to exit the quiz? Your progress will be lost.'
          );
          if (confirmClose) {
            setIsQuizActive(false);
            setQuizData(null);
          }
        }}
        title={quizData?.title || 'Quiz'}
        showConfetti={showConfetti}
      >
        {quizData && (
          <StudentQuizComponent
            quiz={quizData}
            courseId={courseId}
            moduleId={moduleId}
            onQuizComplete={handleQuizComplete}
            onConfettiChange={setShowConfetti}
          />
        )}
      </QuizModal>

      {/* Quiz History */}
      {!isQuizActive && quiz && (
        <div className="mt-4">
          <StudentQuizHistory quizId={quiz.id} />
        </div>
      )}
    </div>
  );
});

StudentQuizSection.displayName = 'StudentQuizSection';

export default StudentQuizSection;

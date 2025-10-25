import React, { memo, useState } from 'react';
import { HelpCircle, Loader2, CheckCircle2, Clock, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStartStudentQuiz } from '@/hooks/student/useStudentQuiz';
import StudentQuizComponent from '@/components/student/StudentQuizComponent';
import StudentQuizHistory from '@/components/student/StudentQuizHistory';

/**
 * Quiz component - memoized for performance
 * Displays quiz information and allows students to start the quiz
 */
const StudentQuizSection = memo(({ quiz, courseId, moduleId, isLoading = false }) => {
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizData, setQuizData] = useState(null);

  // TanStack Query hooks
  const startQuizMutation = useStartStudentQuiz();
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
        <div className="p-4 text-center text-sm text-muted-foreground rounded-lg border border-dashed border-input">
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
      // Error is handled by the mutation
      console.error('Failed to start quiz:', error);
    }
  };

  const handleQuizComplete = () => {
    setIsQuizActive(false);
    setQuizData(null);
  };

  const handleQuizCancel = () => {
    setIsQuizActive(false);
    setQuizData(null);
  };

  const questionCount = quiz._count?.questions || 0;
  const timeLimit = quiz.timeLimit ? formatTime(Math.floor(quiz.timeLimit / 60)) : null;
  const isPublished = quiz.isPublished;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <h3 className="text-sm font-semibold text-foreground">Quiz</h3>
      </div>

      {!isPublished && (
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            This quiz is not yet published and will be available soon.
          </p>
        </div>
      )}

      <Card className={`border-2 transition-all ${isPublished ? 'hover:shadow-md' : 'opacity-75'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base text-foreground truncate">
                {quiz.title || 'Module Quiz'}
              </CardTitle>
              {quiz.description && (
                <CardDescription className="text-xs mt-1 line-clamp-2">
                  {quiz.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quiz Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Questions */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <HelpCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="text-sm font-semibold">{questionCount}</p>
              </div>
            </div>

            {/* Time Limit */}
            {timeLimit && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Time Limit</p>
                  <p className="text-sm font-semibold">{timeLimit}</p>
                </div>
              </div>
            )}

            {/* Attempts */}
            {quiz.attemptLimit && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Zap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Max Attempts</p>
                  <p className="text-sm font-semibold">{quiz.attemptLimit}</p>
                </div>
              </div>
            )}
          </div>

          {/* Start Quiz Button */}
          <Button
            className="w-full"
            disabled={!isPublished || isLoading || startQuizMutation.isPending}
            onClick={handleStartQuiz}
          >
            {startQuizMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting Quiz...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Start Quiz
              </>
            )}
          </Button>

          {!isPublished && (
            <p className="text-xs text-center text-muted-foreground">
              This quiz will be available once the instructor publishes it.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {startQuizMutation.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {startQuizMutation.error?.response?.data?.message ||
             startQuizMutation.error?.message ||
             'Failed to start quiz'}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startQuizMutation.reset()}
              className="ml-2 h-auto p-1"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Active Quiz Component */}
      {isQuizActive && quizData && (
        <div className="mt-6">
          <StudentQuizComponent
            quiz={quizData}
            courseId={courseId}
            moduleId={moduleId}
            onQuizComplete={handleQuizComplete}
            onQuizCancel={handleQuizCancel}
          />
        </div>
      )}

      {/* Quiz History */}
      {!isQuizActive && quiz && (
        <div className="mt-6">
          <StudentQuizHistory quizId={quiz.id} />
        </div>
      )}
    </div>
  );
});

StudentQuizSection.displayName = 'StudentQuizSection';

export default StudentQuizSection;

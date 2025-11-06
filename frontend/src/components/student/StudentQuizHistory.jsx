import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, History, TrendingUp, Clock, Calendar } from 'lucide-react';
import { useStudentQuizSubmissions } from '@/hooks/student/useStudentQuiz';

/**
 * Submission item component - displays individual quiz attempt
 */
const SubmissionItem = memo(({ submission, index }) => {
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (percentage >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startedAt, endedAt) => {
    if (!endedAt) return 'In Progress';

    try {
      const start = new Date(startedAt);
      const end = new Date(endedAt);

      // Ensure dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'Invalid time';
      }

      const duration = Math.floor((end - start) / 1000);

      // Ensure duration is positive
      if (duration <= 0) {
        return '0m 0s';
      }

      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}m ${seconds}s`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'Invalid time';
    }
  };

  return (
    <Card className="mb-3">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-muted-foreground">
                Attempt {index}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground truncate">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate"><strong>Date:</strong> {formatDate(submission.startedAt)}</span>
              </div>

              {submission.endedAt && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span><strong>Time:</strong> {calculateDuration(submission.startedAt, submission.endedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {submission.endedAt && (
            <div className="flex-shrink-0">
              <div className={`rounded px-3 py-2 ${getScoreColor(submission.percentage)}`}>
                <div className="text-lg font-bold">
                  {submission.percentage}%
                </div>
                <div className="text-xs font-medium">
                  {submission.score}/{submission.maxScore}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SubmissionItem.displayName = 'SubmissionItem';

/**
 * Quiz history component - displays all submissions
 */
const StudentQuizHistory = memo(({ quizId }) => {
  const { data: submissionsData, isLoading, error } = useStudentQuizSubmissions(quizId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Quiz History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 p-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading submissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Quiz History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load quiz history. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const submissions = submissionsData?.data || [];
  const completedSubmissions = submissions.filter(s => s.endedAt);

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Quiz History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            No quiz attempts yet. Start a quiz to see your history.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate best score
  const bestScore = completedSubmissions.length > 0
    ? Math.max(...completedSubmissions.map(s => s.percentage))
    : 0;

  // Calculate average score
  const averageScore = completedSubmissions.length > 0
    ? Math.round(
        completedSubmissions.reduce((sum, s) => sum + s.percentage, 0) /
        completedSubmissions.length
      )
    : 0;

  return (
    <div className="space-y-4">
      {/* Submissions List with Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Quiz History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          {completedSubmissions.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-muted-foreground">Best</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{bestScore}%</p>
              </div>

              {completedSubmissions.length > 1 && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Avg</p>
                  <p className="text-2xl font-bold">{averageScore}%</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Attempts ({submissions.length})</h4>
            {submissions.map((submission, index) => (
              <SubmissionItem
                key={submission.id}
                submission={submission}
                index={submissions.length - index}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

StudentQuizHistory.displayName = 'StudentQuizHistory';

export default StudentQuizHistory;

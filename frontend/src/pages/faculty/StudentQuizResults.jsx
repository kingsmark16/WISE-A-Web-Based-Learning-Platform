import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentQuizAttempts } from '@/hooks/faculty/useStudentQuizAttempts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, BookOpen } from 'lucide-react';

const StudentQuizResults = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');

  const { data, isLoading, error } = useStudentQuizAttempts(courseId, studentId);

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button Skeleton */}
          <Skeleton className="h-9 w-32 mb-4" />

          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-64 sm:w-96" />
                <Skeleton className="h-4 w-48 sm:w-80" />
              </div>
            </div>
          </div>

          {/* Table Header Skeleton */}
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="border-b bg-muted/50 p-4">
              <div className="grid grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 grid grid-cols-6 gap-4 hover:bg-muted/30">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="bg-muted/30 border-t px-4 md:px-6 py-4 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-3 w-20 mx-auto" />
                  <Skeleton className="h-8 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <ErrorState
            variant="inline"
            title="Failed to Load Results"
            message="Failed to load quiz results. Please try again later."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  const quizAttempts = data?.quizAttempts || [];
  const studentName = data?.studentName || 'Student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{studentName}'s Quiz Results</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View all quiz attempts across all modules
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Results Table */}
        {quizAttempts.length === 0 ? (
          <div className="bg-card rounded-lg border shadow-sm p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-1">No quiz attempts</p>
            <p className="text-sm text-muted-foreground">
              This student hasn't attempted any quizzes yet.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[20%] font-semibold">Module</TableHead>
                    <TableHead className="w-[25%] font-semibold">Quiz Title</TableHead>
                    <TableHead className="w-[15%] text-center font-semibold">Score</TableHead>
                    <TableHead className="w-[15%] text-center font-semibold">Attempt</TableHead>
                    <TableHead className="w-[15%] text-center font-semibold">Date Taken</TableHead>
                    <TableHead className="w-[10%] text-center font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizAttempts.map((attempt, index) => (
                    <TableRow key={index} className="hover:bg-primary/5 transition-all duration-200">
                      <TableCell className="py-4 text-sm font-medium text-foreground">
                        {attempt.moduleName || 'N/A'}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-foreground">
                        {attempt.quizTitle || 'Untitled Quiz'}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {attempt.score !== null ? `${attempt.score}%` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-center text-sm font-medium">
                        {attempt.attemptNumber || 1}
                      </TableCell>
                      <TableCell className="py-4 text-center text-sm text-muted-foreground">
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {attempt.status === 'completed' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : attempt.status === 'in-progress' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary Stats */}
            <div className="bg-muted/30 border-t px-4 md:px-6 py-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
                <p className="text-2xl font-bold text-foreground">{quizAttempts.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                <p className="text-2xl font-bold text-primary">
                  {quizAttempts.length > 0
                    ? Math.round(
                        quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                          quizAttempts.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Highest Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {quizAttempts.length > 0
                    ? Math.max(...quizAttempts.map((a) => a.score || 0))
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizResults;

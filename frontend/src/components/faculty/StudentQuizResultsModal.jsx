import { useStudentQuizAttempts } from '@/hooks/faculty/useStudentQuizAttempts';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen, X } from 'lucide-react';
import { useEffect } from 'react';

export const StudentQuizResultsModal = ({ courseId, studentId, studentName, isOpen, onClose }) => {
  const { data, isLoading, error } = useStudentQuizAttempts(courseId, studentId);

  const quizAttempts = data?.quizAttempts || [];

  // Prevent body scroll when modal is open and handle back button
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Push a history state to intercept back button
      window.history.pushState({ modal: true }, '');

      // Handle back button press
      const handlePopState = (e) => {
        if (e.state?.modal) {
          e.preventDefault();
          onClose();
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  
  const groupedByModule = quizAttempts.reduce((acc, attempt) => {
    const moduleKey = attempt.moduleId;
    if (!acc[moduleKey]) {
      acc[moduleKey] = {
        moduleId: attempt.moduleId,
        moduleName: attempt.moduleName,
        modulePosition: attempt.modulePosition,
        quizzes: []
      };
    }
    acc[moduleKey].quizzes.push(attempt);
    return acc;
  }, {});

  const moduleRows = Object.values(groupedByModule);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] sm:h-[85vh] md:h-[90vh] lg:h-[90vh] bg-background rounded-lg shadow-lg flex flex-col z-[9999] border-2 border-border">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-background flex items-center justify-between shrink-0 rounded-t-lg gap-2">
          <h2 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground min-w-0">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate">{studentName}'s Quiz Results</span>
          </h2>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring p-1 flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 custom-scrollbar pb-8">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((moduleIdx) => (
                <div key={moduleIdx} className="border rounded-lg overflow-hidden">
                  {/* Module Header Skeleton */}
                  <div className="px-3 sm:px-4 py-2 sm:py-3 border-b bg-muted/50 space-y-2">
                    <Skeleton className="h-5 sm:h-6 w-3/4" />
                  </div>

                  {/* Table Header Skeleton */}
                  <div className="border-b bg-muted/30 p-2 sm:p-3 overflow-x-auto">
                    <div className="grid grid-cols-6 gap-2 min-w-full text-xs sm:text-sm">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-3 w-full" />
                      ))}
                    </div>
                  </div>

                  {/* Table Rows Skeleton */}
                  <div className="divide-y">
                    {[1, 2, 3].map((attemptIdx) => (
                      <div key={attemptIdx} className="p-2 sm:p-3 overflow-x-auto">
                        <div className="grid grid-cols-6 gap-2 min-w-full text-xs sm:text-sm">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Average Score Row Skeleton */}
                  <div className="bg-muted/20 border-t p-2 sm:p-3">
                    <div className="grid grid-cols-6 gap-2 text-xs sm:text-sm">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                      <div />
                      <Skeleton className="h-4 w-16" />
                      <div colSpan={2} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load quiz results. Please try again later.
              </AlertDescription>
            </Alert>
          ) : quizAttempts.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">No quiz attempts</p>
              <p className="text-sm text-muted-foreground">
                This student hasn't attempted any quizzes yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {moduleRows.map((module, moduleIndex) => {
                const avgScore = Math.round(
                  module.quizzes.reduce((sum, a) => sum + (a.score || 0), 0) / module.quizzes.length
                );
                return (
                  <div key={moduleIndex} className="border rounded-lg overflow-hidden bg-card">
                    {/* Module Header */}
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b bg-muted/50">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2">
                        Module {module.modulePosition}: {module.moduleName || 'N/A'}
                      </h3>
                    </div>

                    {/* Attempts Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm md:text-base">
                        <thead className="bg-muted/30 border-b">
                          <tr>
                            <th className="px-2 sm:px-3 py-2 text-left font-semibold text-foreground">Attempt</th>
                            <th className="px-2 sm:px-3 py-2 text-left font-semibold text-foreground">Quiz</th>
                            <th className="px-2 sm:px-3 py-2 text-center font-semibold text-foreground hidden sm:table-cell">Total Items</th>
                            <th className="px-2 sm:px-3 py-2 text-center font-semibold text-foreground">Score</th>
                            <th className="px-2 sm:px-3 py-2 text-center font-semibold text-foreground hidden md:table-cell">Date</th>
                            <th className="px-2 sm:px-3 py-2 text-center font-semibold text-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {module.quizzes.map((attempt, idx) => (
                            <tr key={idx} className="border-b hover:bg-muted/30 last:border-b-0 text-xs sm:text-sm md:text-base">
                              <td className="px-2 sm:px-3 py-2 font-medium text-foreground">{idx + 1}</td>
                              <td className="px-2 sm:px-3 py-2 text-foreground line-clamp-1">{attempt.quizTitle || 'Untitled Quiz'}</td>
                              <td className="px-2 sm:px-3 py-2 text-center font-medium text-foreground hidden sm:table-cell">
                                {attempt.totalItems || '-'}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-center">
                                <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                                  {attempt.score}
                                </span>
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-center text-muted-foreground hidden md:table-cell text-xs sm:text-sm">
                                {new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-center">
                                {attempt.status === 'completed' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
                                    Completed
                                  </span>
                                ) : attempt.status === 'in-progress' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 whitespace-nowrap">
                                    In Progress
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap">
                                    Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-muted/20 border-t-2 font-semibold text-xs sm:text-sm md:text-base">
                            <td colSpan={2} className="px-2 sm:px-3 py-2 text-foreground">Average Score</td>
                            <td className="px-2 sm:px-3 py-2 text-center hidden sm:table-cell"></td>
                            <td className="px-2 sm:px-3 py-2 text-center">
                              <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                                {avgScore}
                              </span>
                            </td>
                            <td colSpan={2} className="px-2 sm:px-3 py-2 hidden md:table-cell"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-8 bg-background border-t"></div>
      </div>
    </div>
  );
};

export default StudentQuizResultsModal;

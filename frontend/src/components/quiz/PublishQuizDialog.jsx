import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const PublishQuizDialog = ({ open, onOpenChange, onConfirm, quiz, isLoading = false }) => {
  if (!quiz) return null;

  const displayTitle = quiz.title || "Untitled Quiz";
  const questionCount = quiz.questions?.length || 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDialogTitle>Publish Quiz</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to publish <strong>"{displayTitle}"</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 px-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm font-medium text-green-900 mb-2">
              Quiz Details:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                <strong>{questionCount}</strong> questions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                <strong>{quiz.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0}</strong> total points
              </li>
              {quiz.timeLimit && quiz.timeLimit > 0 && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  Time limit: <strong>{Math.floor(quiz.timeLimit / 60)} minutes</strong>
                </li>
              )}
              {quiz.attemptLimit && quiz.attemptLimit > 0 && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  Attempt limit: <strong>{quiz.attemptLimit}</strong>
                </li>
              )}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
            Once published, students will be able to see and take this quiz. You can still edit or unpublish it later.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm(quiz);
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {isLoading ? "Publishing..." : "Publish Quiz"}
            </div>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PublishQuizDialog;

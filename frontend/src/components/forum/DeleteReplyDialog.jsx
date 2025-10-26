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
import { Trash2, AlertTriangle } from 'lucide-react';

const DeleteReplyDialog = ({ open, onOpenChange, onConfirm, reply, isLoading = false }) => {
  if (!reply) return null;

  const displayContent = reply.content?.slice(0, 50) || "this reply";
  const truncated = reply.content?.length > 50 ? "..." : "";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Reply</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>"{displayContent}{truncated}"</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 px-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm font-medium text-destructive mb-2">
              This action cannot be undone. This will permanently delete:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                The reply and all its content
              </li>
            </ul>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            onClick={(e) => {
              // Prevent the cancel click from bubbling to parent dialogs/overlays
              e.preventDefault();
              e.stopPropagation();
              if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
                e.nativeEvent.stopImmediatePropagation();
              }
              // Close the alert after a short delay to avoid parent overlay receiving the event
              setTimeout(() => onOpenChange(false), 50);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              // Prevent the click from bubbling to parent dialogs/overlays
              e.preventDefault();
              e.stopPropagation();
              if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
                e.nativeEvent.stopImmediatePropagation();
              }
              try {
                await onConfirm(reply);
              } catch (err) {
                console.error('Failed to delete reply:', err);
              }
              // Close the alert after a short delay so the parent overlay doesn't catch the event
              setTimeout(() => onOpenChange(false), 50);
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {isLoading ? 'Deleting...' : 'Delete Reply'}
            </div>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteReplyDialog;
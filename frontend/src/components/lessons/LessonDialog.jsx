import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const DeleteLessonDialog = ({
  open,
  onOpenChange,
  onConfirm,
  lesson,
  isLoading = false,
}) => {
  if (!lesson) return null;

  const displayTitle = lesson.title || "Untitled Lesson";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>"{displayTitle}"</strong>?
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
                The lesson and all its content
              </li>
            </ul>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm(lesson);
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {isLoading ? "Deleting..." : "Delete Lesson"}
            </div>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
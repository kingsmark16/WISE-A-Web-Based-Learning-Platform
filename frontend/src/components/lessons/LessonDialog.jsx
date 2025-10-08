import React, { useState, useEffect, useRef } from "react";
import { Trash2, AlertTriangle, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Delete dialog (already present)
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

// Edit (rename) dialog
export const EditLessonDialog = ({
  open,
  onOpenChange,
  onConfirm,
  lesson,
  isLoading = false,
  error,
}) => {
  const [newTitle, setNewTitle] = useState(lesson?.title || "");
  const [saving, setSaving] = useState(false);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    if (lesson) {
      setNewTitle(lesson.title || "");
    }
  }, [lesson]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  if (!lesson) return null;

  const savingActive = saving || isLoading;

  // Prevent dialog from closing while saving
  const handleOpenChange = (val) => {
    if (!val && savingActive) return;
    onOpenChange?.(val);
  };

  const waitForIsLoadingFalse = (timeoutMs = 30000) =>
    new Promise((resolve, reject) => {
      const start = Date.now();
      const id = setInterval(() => {
        if (!isLoadingRef.current) {
          clearInterval(id);
          resolve();
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(id);
          reject(new Error("Timeout waiting for loading to finish"));
        }
      }, 100);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSaving(true);
      // Close dialog immediately after clicking Save
      onOpenChange?.(false);

      const result = onConfirm ? onConfirm(lesson, newTitle.trim()) : null;

      // If handler returned a promise, await it.
      if (result && typeof result.then === "function") {
        await result;
      }

      // If caller uses a tanstack mutation and passed its loading state via isLoading prop,
      // wait for that to resolve as well (poll until isLoading becomes false).
      if (isLoadingRef.current) {
        await waitForIsLoadingFalse();
      }

      setSaving(false);
      // dialog already closed above
    } catch (err) {
      setSaving(false);
      console.error("Failed to save lesson title:", err);
      // keep dialog closed (it was closed immediately) so user can re-open and retry
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
          <DialogDescription>
            Update the lesson title.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value.slice(0, 100))}
              placeholder="Lesson title"
              required
              disabled={savingActive}
              maxLength={100}
              autoFocus
            />
            <div className="text-xs text-muted-foreground mt-1">
              {newTitle.length}/100 characters
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error?.message || String(error)}
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2 justify-end w-full">
              <Button
                variant="ghost"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={savingActive}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingActive || !newTitle.trim()}
                className="flex items-center gap-2"
              >
                {savingActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
                {savingActive ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
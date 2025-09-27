import React, { useState, useEffect, useRef } from "react";
import { Trash2, AlertTriangle, Edit3 } from "lucide-react";
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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
}) => {
  const [newTitle, setNewTitle] = useState(lesson?.title || "");
  const [saving, setSaving] = useState(false);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    setNewTitle(lesson?.title || "");
  }, [lesson?.title]);

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

  const handleSave = async () => {
    if (!newTitle.trim()) return;
    try {
      setSaving(true);
      const result = onConfirm ? onConfirm(lesson, newTitle) : null;

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
      onOpenChange?.(false);
    } catch (err) {
      setSaving(false);
      console.error("Failed to save lesson title:", err);
      // keep dialog open so user can retry
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            <DialogTitle>Rename Lesson</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-2">
          <label className="block text-sm mb-2">New title:</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            disabled={savingActive}
          />
        </div>
        <DialogFooter>
          {savingActive ? (
            <button className="px-3 py-2 rounded bg-muted" type="button" disabled>
              Cancel
            </button>
          ) : (
            <DialogClose asChild>
              <button className="px-3 py-2 rounded bg-muted" type="button" disabled={savingActive}>
                Cancel
              </button>
            </DialogClose>
          )}

          <button
            className="px-3 py-2 rounded bg-primary text-white flex items-center gap-2"
            type="button"
            disabled={savingActive || !newTitle.trim()}
            onClick={handleSave}
          >
            <Edit3 className="h-4 w-4" />
            {savingActive ? "Saving..." : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
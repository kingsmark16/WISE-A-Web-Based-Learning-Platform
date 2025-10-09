import React, { useState } from "react";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateLink } from "../../hooks/lessons/useCreateLink";
import { toast } from 'react-toastify';

export default function LinkUploadModal({ open, onClose, moduleId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLinkMutation = useCreateLink(moduleId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) {
      toast.error("Title and URL are required");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);

    try {
      await createLinkMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        url: url.trim()
      });

      // Reset form
      setTitle("");
      setDescription("");
      setUrl("");
      onClose();
    } catch (error) {
      console.error("Failed to create link:", error);
      // Error is handled by the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen && !isSubmitting) {
      setTitle("");
      setDescription("");
      setUrl("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
          <DialogDescription>
            Add an external link as a lesson. The link will open in a new tab when clicked.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Title *</label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter link title"
              required
              disabled={isSubmitting}
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {title.length}/100 characters
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">URL *</label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">
              Description <span className="text-muted-foreground italic">(Optional)</span>
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the link"
              className="h-24 resize-none"
              disabled={isSubmitting}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {description.length}/500 characters
            </div>
          </div>

          {/* Error Display */}
          {createLinkMutation.error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {createLinkMutation.error?.message || String(createLinkMutation.error)}
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2 justify-end w-full">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !url.trim()}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                {isSubmitting ? "Creating..." : "Add Link"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
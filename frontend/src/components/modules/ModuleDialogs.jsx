import React, { useState } from "react";
import { ExternalLink, Loader2, Trash2, AlertTriangle } from "lucide-react"; // Add Trash2 and AlertTriangle
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export const AddModuleDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading, 
  error,
  disabled 
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description });
    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Add Modules
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Module</DialogTitle>
          <DialogDescription>
            Create a new module by providing a title and a short description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              placeholder="Module title"
              required
              disabled={isLoading}
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {title.length}/100 characters
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">
              Description <span className="text-muted-foreground italic">(Optional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of the module"
              rows={4}
              disabled={isLoading}
            />
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
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || disabled} 
                className="flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Creating..." : "Create Module"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const EditModuleDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading, 
  error,
  module 
}) => {
  const [title, setTitle] = useState(module?.title ?? "");
  const [description, setDescription] = useState(module?.description ?? "");

  React.useEffect(() => {
    if (module) {
      setTitle(module.title ?? "");
      setDescription(module.description ?? "");
    }
  }, [module]);

  // Async submit: await onSubmit if it returns a promise, then close on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!module) return;

    try {
      const result = onSubmit({ id: module.id, title: title.trim(), description });

      // If onSubmit returns a promise (e.g. mutateAsync), await it so we only close on success
      if (result && typeof result.then === "function") {
        await result;
      }

      // Close dialog after successful update
      onOpenChange(false);
    } catch (err) {
      // Keep the dialog open so the user can see the error (error prop is shown by parent)
      console.error("Failed to update module:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
          <DialogDescription>Update title or description.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value.slice(0, 100))} 
              maxLength={100} 
              required 
            />
            <div className="text-xs text-muted-foreground mt-1">
              {title.length}/100
            </div>
          </div>
          
          <div className="grid gap-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={4} 
            />
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
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


export const DeleteModuleDialog = ({
    open,
    onOpenChange,
    onConfirm,
    module,
    isLoading = false
}) => {

    if(!module) return null;

    const handleConfirm = () => {
        onConfirm(module.id);
        onOpenChange(false);
    };

    // Get display title with fallback
    const displayTitle = module.title || `Module ${module.position}` || 'Untitled Module';

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <AlertDialogTitle>Delete Module</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>"{displayTitle}"</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {/* Move the content outside AlertDialogDescription to avoid nesting divs in p */}
            <div className="space-y-3 px-6">
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm font-medium text-destructive mb-2">
                  This action cannot be undone. This will permanently delete:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                    The module and all its content
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                    {module._count?.videoLessons || 0} video lesson(s)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                    {module._count?.attachments || 0} attachment(s)
                  </li>
                  {module._count?.quiz > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                      Associated quiz(es)
                    </li>
                  )}
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                All remaining modules will be repositioned automatically.
              </p>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                disabled={isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  {isLoading ? "Deleting..." : "Delete Module"}
                </div>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    )
}
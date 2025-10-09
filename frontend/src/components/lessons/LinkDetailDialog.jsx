import React from "react";
import { ExternalLink, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const LinkDetailDialog = ({ open, onOpenChange, link }) => {
  if (!link) return null;

  const handleNavigateToLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
    onOpenChange(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] sm:max-h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-600" />
            {link.title}
          </DialogTitle>
          <DialogDescription>
            External link details and information
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* URL Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">URL</label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground break-all">{link.url}</span>
            </div>
          </div>

          {/* Description Section */}
          {link.description && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{link.description}</p>
              </div>
            </div>
          )}

          {/* Metadata Section */}
          <div className="space-y-3 pt-2 border-t">
            <h4 className="text-sm font-medium text-foreground">Link Information</h4>

            <div className="grid grid-cols-1 gap-3 text-sm">
              {link.updatedAt && link.updatedAt !== link.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="text-foreground">{formatDate(link.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleNavigateToLink} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Open Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LinkDetailDialog;
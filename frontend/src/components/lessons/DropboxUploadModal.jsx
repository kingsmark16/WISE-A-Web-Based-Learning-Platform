import React, { useState, useRef, useEffect } from "react";
import { X, UploadCloud, Trash2, Video, CheckCircle2, AlertCircle, Loader2, Film } from "lucide-react";
import { useUploadToDropbox } from "../../hooks/lessons/useUploadToDropbox";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const bytesToSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export default function DropboxUploadModal({ open, onClose, moduleId }) {
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const { mutateAsync: uploadDropboxAsync, cancelUpload } = useUploadToDropbox();
  const [items, setItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const addFiles = (files) => {
    const arr = Array.from(files || []).filter(f => f.type.startsWith('video/'));
    if (arr.length === 0) {
      toast.error('Please select video files only');
      return;
    }
    const newItems = arr.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file: f,
      progress: 0,
      status: "queued",
      abortId: null,
      error: null,
    }));
    setItems((s) => [...s, ...newItems]);
    startUploads(newItems);
  };

  const onFilesPicked = (e) => {
    addFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const startUploads = (itemsToStart) => {
    itemsToStart.forEach(async (it) => {
      setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "uploading", progress: 0, abortId: it.id } : x)));

      try {
        await uploadDropboxAsync({
          files: [it.file],
          moduleId,
          uploadId: it.id,
          onProgress: (p) => {
            setItems((s) => s.map((x) => (x.id === it.id ? { ...x, progress: p } : x)));
          },
        });

        setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "done", progress: 100, abortId: null } : x)));
        if (moduleId) queryClient.invalidateQueries({ queryKey: ["module", moduleId] });
        toast.success(`Video "${it.file.name}" uploaded successfully!`);
      } catch (err) {
        const canceled = err?.name === "CanceledError" || /aborted|canceled/i.test(String(err?.message || err));
        setItems((s) =>
          s.map((x) =>
            x.id === it.id
              ? { ...x, status: canceled ? "canceled" : "error", error: canceled ? null : (err?.message || String(err)), abortId: null }
              : x
          )
        );
        if (!canceled) {
          toast.error(`Failed to upload video "${it.file.name}". Please try again.`);
        }
      }
    });
  };

  const handleCancel = (id) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    if (it.abortId) {
      cancelUpload(it.abortId);
      setItems((s) => s.map((x) => (x.id === id ? { ...x, status: "canceled", abortId: null } : x)));
    } else {
      setItems((s) => s.map((x) => (x.id === id ? { ...x, status: "canceled" } : x)));
    }
  };

  const handleRemove = (id) => {
    setItems((s) => s.filter((x) => x.id !== id));
  };

  const allFinished = items.length > 0 && items.every((i) => i.status === "done" || i.status === "error" || i.status === "canceled");

  const uploadingCount = items.filter(i => i.status === "uploading").length;
  const completedCount = items.filter(i => i.status === "done").length;

  const getStatusIcon = (status) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
      case "uploading":
        return <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />;
      case "canceled":
        return <X className="h-3.5 w-3.5 text-muted-foreground" />;
      default:
        return <Film className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "done":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 text-[10px] sm:text-xs">Uploaded</Badge>;
      case "error":
        return <Badge variant="destructive" className="text-[10px] sm:text-xs">Failed</Badge>;
      case "uploading":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] sm:text-xs">Uploading</Badge>;
      case "canceled":
        return <Badge variant="secondary" className="text-[10px] sm:text-xs">Canceled</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] sm:text-xs">Queued</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
        {/* Modal */}
        <div className="relative w-full max-w-md sm:max-w-lg bg-background rounded-xl shadow-2xl overflow-hidden border animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Video className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-semibold">Upload Videos</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3 space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto">
          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`p-2 rounded-full transition-colors ${isDragging ? "bg-primary/10" : "bg-muted"}`}>
                <UploadCloud className={`h-6 w-6 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="space-y-0.5">
                <p className="font-medium text-xs">
                  {isDragging ? "Drop your videos here" : "Click to select or drag & drop"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  MP4, MOV, AVI, WebM
                </p>
              </div>
            </div>
            <input 
              ref={inputRef} 
              type="file" 
              accept="video/*" 
              multiple 
              className="hidden" 
              onChange={onFilesPicked} 
            />
          </div>

          {/* File List */}
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {items.map((it) => (
                  <div 
                    key={it.id} 
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getStatusIcon(it.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs truncate flex-1">{it.file.name}</span>
                        {getStatusBadge(it.status)}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {it.status === "uploading" ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCancel(it.id)} 
                          className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 text-[10px]"
                        >
                          Cancel
                        </Button>
                      ) : (it.status === "done" || it.status === "error" || it.status === "canceled") ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(it.id)}
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Finished Message */}
          {allFinished && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              <span className="text-[10px] text-green-600 dark:text-green-400">
                All uploads finished!
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-3 py-2 border-t bg-card">
          <Button variant="outline" onClick={onClose} className="h-7 text-xs">
            Close
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
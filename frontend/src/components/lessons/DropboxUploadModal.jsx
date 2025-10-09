import React, { useState, useRef } from "react";
import { X, UploadCloud, Trash2 } from "lucide-react";
import { useUploadToDropbox } from "../../hooks/lessons/useUploadToDropbox";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';

const bytesToSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export default function DropboxUploadModal({ open, onClose, moduleId }) {
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  // now also get cancelUpload from the hook
  const { mutateAsync: uploadDropboxAsync, cancelUpload } = useUploadToDropbox();
  const [items, setItems] = useState([]); // { id, file, progress, status, abortId }

  if (!open) return null;

  const addFiles = (files) => {
    const arr = Array.from(files || []);
    const newItems = arr.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file: f,
      progress: 0,
      status: "queued", // queued | uploading | done | error | canceled
      abortId: null,
      error: null,
    }));
    setItems((s) => [...s, ...newItems]);
    // auto-start upload for newly added files
    startUploads(newItems);
  };

  const onFilesPicked = (e) => {
    addFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const startUploads = (itemsToStart) => {
    itemsToStart.forEach(async (it) => {
      // set to uploading and assign abortId (we use the item's id)
      setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "uploading", progress: 0, abortId: it.id } : x)));

      try {
        // pass uploadId so the hook can expose a cancel handle for this upload
        await uploadDropboxAsync({
          files: [it.file],
          moduleId,
          uploadId: it.id,
          onProgress: (p) => {
            setItems((s) => s.map((x) => (x.id === it.id ? { ...x, progress: p } : x)));
          },
        });

        // success
        setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "done", progress: 100, abortId: null } : x)));
        if (moduleId) queryClient.invalidateQueries({ queryKey: ["module", moduleId] });
        toast.success(`File "${it.file.name}" uploaded successfully!`);
      } catch (err) {
        // if request was aborted client-side, status will be 'canceled' here
        const canceled = err?.name === "CanceledError" || /aborted|canceled/i.test(String(err?.message || err));
        setItems((s) =>
          s.map((x) =>
            x.id === it.id
              ? { ...x, status: canceled ? "canceled" : "error", error: canceled ? null : (err?.message || String(err)), abortId: null }
              : x
          )
        );
        if (!canceled) {
          toast.error(`Failed to upload file "${it.file.name}". Please try again.`);
        }
      }
    });
  };

  const handleCancel = (id) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    if (it.abortId) {
      // call cancelUpload from hook using the uploadId stored on item
      const ok = cancelUpload(it.abortId);
      if (ok) {
        setItems((s) => s.map((x) => (x.id === id ? { ...x, status: "canceled", abortId: null } : x)));
      } else {
        // fallback mark canceled locally (server might still complete)
        setItems((s) => s.map((x) => (x.id === id ? { ...x, status: "canceled", abortId: null } : x)));
      }
    } else {
      // not started or already finished — just remove locally
      setItems((s) => s.map((x) => (x.id === id ? { ...x, status: "canceled" } : x)));
    }
  };

  const handleRemove = (id) => {
    setItems((s) => s.filter((x) => x.id !== id));
  };


  const allFinished = items.every((i) => i.status === "done" || i.status === "error" || i.status === "canceled") && items.length > 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Upload to Dropbox</h3>
          <div className="flex items-center gap-2">
            <button onClick={onClose} title="Close" className="p-1 rounded hover:bg-muted/10">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-center gap-3">
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
              <div>
                <div className="font-semibold">Click to select or drop video files here</div>
              </div>
            </div>
            <input ref={inputRef} type="file" accept="video/*" multiple className="hidden" onChange={onFilesPicked} />
          </div>

          <div className="space-y-3 max-h-64 overflow-auto">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 bg-muted/5 p-2 rounded">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{it.file.name}</div>
                      <div className="text-xs text-muted-foreground">{bytesToSize(it.file.size)}</div>
                    </div>
                    <div className="text-xs ml-3 w-20 text-right">
                      {it.status === "uploading" && <span>Uploading…</span>}
                      {it.status === "queued" && <span>Queued</span>}
                      {it.status === "done" && <span className="text-green-600">Uploaded</span>}
                      {it.status === "error" && <span className="text-destructive">Error</span>}
                      {it.status === "canceled" && <span className="text-muted-foreground">Canceled</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {it.status === "uploading" && (
                    <button onClick={() => handleCancel(it.id)} className="px-2 py-1 text-xs rounded bg-destructive/10 text-destructive hover:bg-destructive/20">
                      Cancel
                    </button>
                  )}
                  {(it.status === "done" || it.status === "error" || it.status === "canceled") && (
                    <button onClick={() => handleRemove(it.id)} className="p-1 rounded hover:bg-muted/10" title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {items.length} file{items.length !== 1 ? "s" : ""} queued
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-3 py-1 rounded bg-muted/10 hover:bg-muted/20">
                Close
              </button>
            </div>
          </div>

          {allFinished && (
            <div className="text-xs text-muted-foreground">All uploads finished. You can close this dialog.</div>
          )}
        </div>
      </div>
    </div>
  );
}
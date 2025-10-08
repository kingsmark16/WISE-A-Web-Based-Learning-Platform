import React, { useState, useRef } from "react";
import { X, UploadCloud, Trash2 } from "lucide-react";
import { useUploadToYoutube } from "../../hooks/lessons/useUploadToYoutube";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';

const bytesToSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export default function YoutubeUploadModal({ open, onClose, moduleId }) {
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const { mutateAsync: uploadYoutubeAsync, cancelUpload } = useUploadToYoutube();
  const [items, setItems] = useState([]); // { id, file, progress, status, abortId, error }
  const [expanded, setExpanded] = useState(new Set());

  if (!open) return null;

  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    };
  };

  const extractErrorMessage = (err) => {
    // common places for useful messages (axios / gaxios / fetch nested)
    const short =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.cause?.message ||
      err?.message ||
      String(err);
    // produce a safe JSON dump for details
    let details = "";
    try {
      details = JSON.stringify(err, getCircularReplacer(), 2);
    } catch {
      details = String(err);
    }
    return { short, details };
  };

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
      setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "uploading", progress: 0, abortId: it.id, error: null } : x)));

      try {
        // call mutation and inspect response for per-file failures (server may return 200 with partial failures)
        const result = await uploadYoutubeAsync({
          files: [it.file],
          moduleId,
          uploadId: it.id,
          onProgress: (p) => {
            setItems((s) => s.map((x) => (x.id === it.id ? { ...x, progress: p } : x)));
          },
        });

        const payload = result?.data ?? result;

        // If server returned a failedUploads array, prefer its per-file error messages.
        const failedUploads = Array.isArray(payload?.failedUploads) ? payload.failedUploads : null;
        if (failedUploads && failedUploads.length) {
          // try to find entry that matches this file (exact name, uploadId, or contains name)
          const match = failedUploads.find((f) => {
            if (!f) return false;
            if (f.uploadId && f.uploadId === it.id) return true;
            if (f.originalFilename && f.originalFilename === it.file.name) return true;
            if (f.originalFilename && it.file.name && f.originalFilename.includes(it.file.name)) return true;
            return false;
          });
          if (match) {
            const msg = match.error || match.message || "Upload failed";
            setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "error", progress: x.progress || 0, abortId: null, error: msg } : x)));
            return;
          }
        }

        // heuristics to detect server-side failure for this file:
        const hasGlobalError = !!(payload?.error || payload?.errors || (Array.isArray(payload?.failed) && payload.failed.length) || (Array.isArray(payload?.failedUploads) && payload.failedUploads.length));
        // some servers return an array with per-upload results
        const perResults = payload?.uploadResults || payload?.results || payload?.uploaded || payload?.uploadedVideos || payload?.uploads || null;

        // find specific entry for this file (check originalname, filename, or uploadId)
        let entryForFile = null;
        if (Array.isArray(perResults)) {
          entryForFile = perResults.find((r) => {
            if (!r) return false;
            if (r.uploadId && r.uploadId === it.id) return true;
            if (r.originalFilename && r.originalFilename === it.file.name) return true;
            if (r.originalname && r.originalname === it.file.name) return true;
            if (r.filename && it.file.name && r.filename === it.file.name) return true;
            // fallback: match by presence of video/lesson in success entry
            return false;
          });
        }

        // determine final state & message
        if (hasGlobalError && !entryForFile) {
          // some global error, show message
          const { short, details } = extractErrorMessage(payload);
          setItems((s) =>
            s.map((x) => (x.id === it.id ? { ...x, status: "error", progress: 0, abortId: null, error: short || "Upload failed", errorDetails: details } : x))
          );
          toast.error(`Failed to upload video "${it.file.name}". ${short || "Please try again."}`);
        } else if (entryForFile && (entryForFile.error || entryForFile.success === false || entryForFile.status === "error")) {
          const { short, details } = extractErrorMessage(entryForFile.error ? entryForFile.error : (entryForFile.message || payload));
          const msg = entryForFile.error || entryForFile.message || short || "Upload failed";
          setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "error", progress: x.progress || 0, abortId: null, error: msg, errorDetails: details } : x)));
          toast.error(`Failed to upload video "${it.file.name}". ${msg}`);
        } else {
          // success path
          setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "done", progress: 100, abortId: null, error: null } : x)));
          // Let the hook handle immediate cache update, then invalidate to ensure fresh data
          setTimeout(() => {
            if (moduleId) queryClient.invalidateQueries({ queryKey: ["module", moduleId] });
          }, 1000);
          toast.success(`Video "${it.file.name}" uploaded successfully!`);
        }
      } catch (err) {
        const canceled = err?.name === "CanceledError" || /aborted|canceled/i.test(String(err?.message || err));
        const { short, details } = extractErrorMessage(err);
        setItems((s) =>
          s.map((x) =>
            x.id === it.id
              ? { ...x, status: canceled ? "canceled" : "error", error: canceled ? null : short, errorDetails: canceled ? null : details, abortId: null }
              : x
          )
        );
        if (!canceled) {
          toast.error(`Failed to upload video "${it.file.name}". ${short || "Please try again."}`);
        }
      }
    });
  };

  const handleCancel = (id) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    if (it.abortId) {
      const ok = cancelUpload(it.abortId);
      if (ok) {
        setItems((s) => s.map((x) => (x.id === id ? { ...x, status: "canceled", abortId: null } : x)));
      } else {
        setItems((s) => s.map((x) => (x.id === id ? { ...x, status: "canceled", abortId: null } : x)));
      }
    } else {
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
          <h3 className="text-lg font-semibold">Upload to YouTube</h3>
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
                <div className="font-semibold">Click to select or drop video files to upload to YouTube</div>
                <div className="text-sm text-muted-foreground">Multiple files supported. Each file uploads separately and shows its own progress.</div>
              </div>
            </div>
            <input ref={inputRef} type="file" accept="video/*" multiple className="hidden" onChange={onFilesPicked} />
          </div>

          <div className="space-y-3 max-h-64 overflow-auto">
            {items.length === 0 && <div className="text-sm text-muted-foreground">No files queued</div>}
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 bg-muted/5 p-2 rounded">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{it.file.name}</div>
                      <div className="text-xs text-muted-foreground">{bytesToSize(it.file.size)}</div>
                      {it.status === "error" && it.error && (
                        <>
                          <div className="text-xs text-destructive mt-1 truncate" title={it.error}>
                            {it.error}
                          </div>
                          {it.errorDetails && (
                            <div className="mt-1 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const next = new Set(expanded);
                                  if (next.has(it.id)) next.delete(it.id);
                                  else next.add(it.id);
                                  setExpanded(next);
                                }}
                                className="text-xs underline text-muted-foreground"
                              >
                                {expanded.has(it.id) ? "Hide details" : "Show details"}
                              </button>
                            </div>
                          )}
                          {expanded.has(it.id) && it.errorDetails && (
                            <pre className="mt-1 p-2 bg-muted/5 text-xs rounded max-h-40 overflow-auto text-ellipsis" title="Raw error">
                              {it.errorDetails}
                            </pre>
                          )}
                        </>
                      )}
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
              <button onClick={() => inputRef.current?.click()} className="px-3 py-1 rounded bg-primary/10 hover:bg-primary/20">
                Add files
              </button>
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
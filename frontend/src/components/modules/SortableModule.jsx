import React, { useState, useEffect, useRef } from "react";
import { Edit3, Trash2, Loader2, Play, GripVertical } from "lucide-react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CSS } from "@dnd-kit/utilities";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";

import { useGetModule } from "../../hooks/useModule";
import { useReorderLessons } from "../../hooks/useLessson";
import useDeleteFromDropbox from "../../hooks/lessons/useDeleteFromDropbox";
import useEditFromDropbox from "../../hooks/lessons/useEditFromDropbox";
import useEditPdf from "../../hooks/lessons/useEditPdf";
import { useDeletePdf } from "../../hooks/lessons/useDeletePdf";

import UploadActions from "../lessons/UploadActions";
import LessonList from "../lessons/LessonList";
import PdfViewer from "../PdfViewer";
import EmbedYt from "../EmbedYt";
import VideoPlayer from "../videoPlayer";

// added: upload hook import
import { useUploadToDropbox } from "../../hooks/lessons/useUploadToDropbox";
import { useQueryClient } from "@tanstack/react-query";

// new import for modal
import DropboxUploadModal from "../lessons/DropboxUploadModal";

const SortableModule = ({
  item,
  listenersDisabled = false,
  isOpen = false,
  onEdit,
  onDelete,
  onDeleteLesson,
  onUploadYoutube,
  onUploadDropbox,
  onPasteLink,
  onUploadPdf,
  onAddLink,
  onCreateQuiz,
}) => {
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  // file input + upload state (optional fallback if parent doesn't handle upload)
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [finalizing, setFinalizing] = useState(false);

  // store abort function returned by the upload mutation so we can cancel
  const abortRef = useRef(null);
  const queryClient = useQueryClient();

  // local lessons and rollback ref for smooth drag (match module behaviour)
  const [localLessons, setLocalLessons] = useState([]);
  const prevLessonsRef = useRef(null);

  // active id + overlay size
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [overlaySize, setOverlaySize] = useState(null); // { width, height }

  // ---------- MODULE sortable (re-added) ----------
  // useSortable for the module item itself so modules can be dragged by the header handle
  const {
    attributes: moduleAttributes,
    listeners: moduleListeners,
    setNodeRef: setModuleNodeRef,
    transform: moduleTransform,
    transition: moduleTransition,
    isDragging: moduleIsDragging,
  } = useSortable({ id: item.id });
  // -------------------------------------------------

  // fetch module data
  const { data: moduleData, isLoading: moduleLoading, error: moduleError } = useGetModule(
    item.id,
    isOpen
  );

  // sync server lessons into localLessons (sorted by position)
  useEffect(() => {
    const lessons = moduleData?.module?.lessons || [];
    const sorted = lessons.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    setLocalLessons(sorted);
  }, [moduleData?.module?.lessons]);
 
  // modal state for internal dropbox uploader
  const [showDropboxModal, setShowDropboxModal] = useState(false);

  // open hidden file picker
  const openDropboxPicker = () => {
    // prefer modal for nicer UX
    setShowDropboxModal(true);
    // keep legacy hidden input for fallback
    // fileInputRef.current?.click();
  };

  // handle chosen files — call hook with same argument shape as other mutate calls
  const handleDropboxFiles = async (e) => {
    const files = e?.target?.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setFinalizing(false);
    try {
      const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      abortRef.current = () => {
        try {
          if (typeof cancelUpload === "function") cancelUpload(uploadId);
        } catch { /* ignore */ }
      };

      await uploadDropboxAsync({
        files,
        moduleId,
        uploadId,
        onProgress: (p) => {
          // if progress gets to 100 we are likely done streaming to server,
          // mark finalizing so UI disables cancel (server may still be processing)
          if (p >= 100) setFinalizing(true);
          setUploadProgress(p);
        },
      });
 
      if (moduleId) queryClient.invalidateQueries({ queryKey: ["module", moduleId] });
    } catch (err) {
      console.error("Dropbox upload failed", err);
      throw err;
    } finally {
      abortRef.current = null;
      setUploading(false);
      setFinalizing(false);
      if (e && e.target) e.target.value = "";
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  const handleCancelUpload = () => {
    // prefer the explicit abortRef (per-upload), fallback to using hook cancel without id if available
    // if finalizing on server we can't reliably prevent DB save; consider calling server cleanup endpoint here
    if (abortRef.current && typeof abortRef.current === "function") {
      try {
        abortRef.current();
      } catch (e) {
        console.warn("Failed to abort upload", e);
      } finally {
        abortRef.current = null;
        setUploading(false);
        setUploadProgress(0);
        setFinalizing(false);
      }
      return;
    }

    // global fallback (if we somehow only have cancelUpload)
    try {
      if (typeof cancelUpload === "function") {
        // can't know id here, so this is a no-op unless you store a global id
        console.warn("No upload-specific abort available; call cancelUpload(uploadId) if you have the id");
      }
    } catch { /* ignore */ }
  };

  // reorder hook (optimistic handled inside hook)
  const moduleId = moduleData?.module?.id;
  const reorderMutation = useReorderLessons(moduleId);

  // sensors: pointer + touch, same activationConstraint as modules
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayLesson = (idx) => {
    setCurrentLessonIndex(idx);
    setVideoPlayerOpen(true);
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < localLessons.length - 1) setCurrentLessonIndex(currentLessonIndex + 1);
  };
  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) setCurrentLessonIndex(currentLessonIndex - 1);
  };

  // pass moduleId so hook can optimistic-update the correct cache
  const {
    mutateAsync: editDropboxLessonAsync,
    isPending: editDropboxPending
  } = useEditFromDropbox(moduleId);

  const {
    mutateAsync: editPdfLessonAsync,
    isPending: editPdfPending
  } = useEditPdf(moduleId);

  const {
    mutateAsync: deleteDropboxLessonAsync
  } = useDeleteFromDropbox(moduleId);

  const {
    mutateAsync: deletePdfLessonAsync,
  } = useDeletePdf(moduleId);

  // upload hook (matches edit/delete pattern: returns mutateAsync + cancelUpload)
  const { mutateAsync: uploadDropboxAsync, cancelUpload, isLoading: uploadDropboxPending } = useUploadToDropbox();
  
  // Example handler for editing a lesson
  const handleEditLessonLocal = async (lesson, e, newTitle) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();

    const type = String(lesson?.type || "").toUpperCase();
    if (type === "DROPBOX") {
      // return the promise so callers (the dialog) can await and close on success
      return editDropboxLessonAsync({ lessonId: lesson.id, title: newTitle, type: lesson.type }).catch((err) => {
        console.error("Failed to edit Dropbox lesson:", err);
        throw err;
      });
    }

    if (type === "PDF") {
      return editPdfLessonAsync({ lessonId: lesson.id, title: newTitle, type: lesson.type }).catch((err) => {
        console.error("Failed to edit PDF lesson:", err);
        throw err;
      });
    }

    return null;
  };

  const handleDeleteLessonLocal = async (lesson, e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();

    // Delete PDF lessons via PDF endpoint
    if (String(lesson?.type || "").toUpperCase() === "PDF") {
      try {
        await deletePdfLessonAsync({ lessonId: lesson.id, type: lesson.type });
       
        return;
      } catch (err) {
        console.error("Failed to delete PDF lesson:", err);
      }
    }

    // Only delete from Dropbox if lesson type is DROPBOX
    if (String(lesson?.type || "").toUpperCase() === "DROPBOX") {
      try {
        await deleteDropboxLessonAsync({ lessonId: lesson.id, type: lesson.type });
       
        return;
      } catch (err) {
        console.error("Failed to delete Dropbox lesson:", err);
      }
    }

    onDeleteLesson?.(lesson, e);
  };

  // Drag handlers: match module behaviour (update local order on drag END)
  const handleDragStart = (event) => {
    const id = event.active?.id;
    setActiveLessonId(id || null);
    prevLessonsRef.current = localLessons.slice();

    if (id) {
      // find the original lesson DOM node and measure it
      const node = document.querySelector(`[data-lesson-id="${id}"]`);
      if (node) {
        const rect = node.getBoundingClientRect();
        setOverlaySize({
          width: Math.round(rect.width) + "px",
          height: Math.round(rect.height) + "px"
        });
      } else {
        setOverlaySize(null);
      }
    }
  };

  const handleDragEnd = (event) => {
    setActiveLessonId(null);
    setOverlaySize(null);

    const { active, over } = event;
    if (!active || !over) return;
    if (active.id === over.id) return;

    const oldIndex = localLessons.findIndex((l) => l.id === active.id);
    const newIndex = localLessons.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // compute new order and immediately apply locally (identical to modules)
    const next = arrayMove(localLessons, oldIndex, newIndex);
    setLocalLessons(next);

    // prepare orderedLessons payload (1-based positions)
    const orderedLessons = next.map((l, idx) => ({ id: l.id, position: idx + 1 }));

    // call mutation with rollback on error
    reorderMutation.mutate( { orderedLessons }, {
      onError: () => {
        if (prevLessonsRef.current) setLocalLessons(prevLessonsRef.current);
      },
      onSettled: () => {
        prevLessonsRef.current = null;
      }
    });
  };

  const renderModuleContent = () => {
    if (moduleLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading module details...
        </div>
      );
    }
    if (moduleError) {
      return <div className="text-sm text-destructive">Failed to load module details</div>;
    }
    if (!moduleData?.module) {
      return <div>No module details</div>;
    }

    const lessons = localLessons;

    return (
      <div className="space-y-4 sm:space-y-6">
        {moduleData.module.description ? (
          <p className="text-sm text-muted-foreground break-words leading-relaxed">{moduleData.module.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description</p>
        )}

        <UploadActions
          onUploadYoutube={() => onUploadYoutube?.(item)}
          // prefer parent handler (same format as edit/delete). if none, fall back to internal picker.
          onUploadDropbox={() => {
            if (typeof onUploadDropbox === "function") return onUploadDropbox(item);
            return openDropboxPicker();
          }}
          onPasteLink={() => onPasteLink?.(item)}
          onUploadPdf={() => onUploadPdf?.(item)}
          onAddLink={() => onAddLink?.(item)}
          onCreateQuiz={() => onCreateQuiz?.(item)}
        />

        {/* hidden file input fallback (used only when parent doesn't provide onUploadDropbox) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleDropboxFiles}
          style={{ display: "none" }}
          disabled={uploading}
        />
 
        {uploading && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(Math.max(uploadProgress, 0), 100)}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground tabular-nums w-12 text-right">
                {uploadProgress}% 
              </div>
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 text-xs rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
                onClick={handleCancelUpload}
                disabled={finalizing || uploadDropboxPending || uploadProgress >= 100}
              >
                Cancel
              </button>
            </div>
            {uploadDropboxPending && <div className="text-xs text-muted-foreground">Finalizing upload...</div>}
          </div>
        )}

        {lessons.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <LessonList
                lessons={lessons}
                activeLessonId={activeLessonId}
                formatDuration={formatDuration}
                onPlayLesson={handlePlayLesson}
                onEditLesson={handleEditLessonLocal}
                onDeleteLesson={handleDeleteLessonLocal}
                editPending={Boolean(editDropboxPending || editPdfPending)}
              />
            </SortableContext>

            <DragOverlay>
              {activeLessonId ? (() => {
                const active = lessons.find(l => l.id === activeLessonId);
                if (!active) return null;
                // apply measured size so overlay matches original responsive sizing
                const overlayStyle = overlaySize ? { width: overlaySize.width, height: overlaySize.height } : { minWidth: "220px" };

                return (
                  // pointer-events-none so the overlay won't block pointer movement
                  <div
                    className="pointer-events-none z-[99999] rounded-lg shadow-lg border-2 border-input bg-card overflow-hidden"
                    style={overlayStyle}
                  >
                    <div className="w-full p-1.5 sm:p-2 md:p-3 lg:p-4">
                      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                        <div className="flex-shrink-0 mr-1 sm:mr-2 w-6 sm:w-8 p-1 rounded-md flex items-center justify-center">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="hidden sm:flex relative flex-shrink-0 w-10 h-8 sm:w-14 sm:h-10 md:w-20 md:h-14 lg:w-24 lg:h-16 rounded-md overflow-hidden bg-muted items-center justify-center">
                          {active.type && String(active.type).toLowerCase() === "pdf" ? (
                            <img src="/pdf.png" alt="PDF" className="w-full h-full object-contain" />
                          ) : active.thumbnail ? (
                            <img src={active.thumbnail} alt={active.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                            </div>
                          )}

                          {active.duration && formatDuration && (
                            <div className="absolute bottom-0 right-0 text-xs px-1 sm:px-1.5 py-0.5 rounded-bl-md bg-black/70 text-white">
                              {formatDuration(active.duration)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm md:text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                              { /* optional position badge */ }
                            </span>
                            <div className="min-w-0">
                              <h6 className="text-xs sm:text-sm md:text-base font-semibold leading-tight text-foreground break-words whitespace-normal">
                                {active.title}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })() : null}
            </DragOverlay>
          </DndContext>
        )}

        {moduleData.module.quiz && (
          <div>{/* quiz UI (unchanged) */}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
          <div className="text-center sm:text-left">
            <div className="text-lg font-bold text-primary">{lessons.length}</div>
            <div className="text-xs text-muted-foreground">Video{lessons.length !== 1 ? "s" : ""}</div>
          </div>

          <div className="text-center sm:text-left">
            <div className="text-lg font-bold text-green-600">
              {formatDuration(lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)) || "0:00"}
            </div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
        </div>
      </div>
    );
  };

  // Keep module header non-draggable here (module-level drag handled elsewhere)
  const style = {
    transform: moduleTransform ? CSS.Transform.toString(moduleTransform) : undefined,
    transition: moduleTransition,
    cursor: "grab",
    opacity: moduleIsDragging ? 0.75 : 1,
  };

  const lessonsForPlayer = localLessons || [];
  const currentLesson = lessonsForPlayer[currentLessonIndex];

  return (
    <>
      <AccordionItem
        value={item.id}
        key={item.id}
        ref={setModuleNodeRef}
        className="relative rounded-lg overflow-hidden border-2 bg-card shadow-lg hover:shadow-xl border-input transition-all duration-200 hover:border-primary/30 w-full min-w-0 overflow-x-hidden box-border"
        style={style}
      >
        <AccordionTrigger className="group py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-6 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 hover:bg-accent/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]]:border-b [&[data-state=open]]:border-border w-full min-w-0 overflow-hidden box-border">
          <div
            className="flex-shrink-0 mr-2 sm:mr-3 p-1 rounded cursor-grab active:cursor-grabbing touch-none select-none hover:bg-accent/30 transition-colors"
            {...(listenersDisabled ? {} : { ...moduleAttributes })}
            {...(listenersDisabled ? {} : { ...moduleListeners })}
            style={{ touchAction: "none" }}
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </div>

          <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2 sm:pr-3 md:pr-40">
            <div className="text-xs sm:text-sm md:text-base font-semibold leading-tight text-left overflow-hidden min-w-0">
              <span className="text-xs sm:text-xs md:text-sm flex-shrink-0 mr-1">Module {item.position}:</span>
              <span className="block whitespace-wrap break-words overflow-hidden min-w-0" title={item.title}>{item.title}</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground sm:hidden">
              {(item._count?.lessons ?? 0) + (item._count?.attachments ?? 0)} lessons
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <div className="text-sm text-muted-foreground whitespace-nowrap max-w-[5.5rem] overflow-hidden truncate flex-shrink-0">
              {(item._count?.lessons ?? 0) + (item._count?.attachments ?? 0)} lessons
            </div>

            <div className={`flex items-center gap-2 transition-all duration-200 ${isOpen ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"}`} onClick={(e) => e.stopPropagation()}>
              <div role="button" tabIndex={0} title="Edit module" className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}>
                <Edit3 className="h-4 w-4" />
              </div>
              <div role="button" tabIndex={0} title="Delete module" className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); onDelete?.(item); }}>
                <Trash2 className="h-4 w-4" />
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 bg-gradient-to-b from-muted/20 to-transparent">
          {renderModuleContent()}
        </AccordionContent>
      </AccordionItem>

      {/* modal instance (open when user triggers upload and parent didn't handle upload) */}
      <DropboxUploadModal open={showDropboxModal} onClose={() => setShowDropboxModal(false)} moduleId={moduleId} />

      {currentLesson && (
        <>
          {currentLesson.type === "PDF" ? (
            <PdfViewer open={videoPlayerOpen} onClose={() => setVideoPlayerOpen(false)} pdfUrl={currentLesson.url} title={currentLesson.title} />
          ) : currentLesson.type === "YOUTUBE" ? (
            <EmbedYt open={videoPlayerOpen} onOpenChange={setVideoPlayerOpen} lesson={currentLesson} onNext={handleNextLesson} onPrevious={handlePreviousLesson} hasNext={currentLessonIndex < lessonsForPlayer.length - 1} hasPrevious={currentLessonIndex > 0} />
          ) : (
            <VideoPlayer open={videoPlayerOpen} onClose={() => setVideoPlayerOpen(false)} url={currentLesson.url} title={currentLesson.title} onNext={handleNextLesson} onPrevious={handlePreviousLesson} hasNext={currentLessonIndex < lessonsForPlayer.length - 1} hasPrevious={currentLessonIndex > 0} />
          )}
        </>
      )}
    </>
  );
};

export default SortableModule;
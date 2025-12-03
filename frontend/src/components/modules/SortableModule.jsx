import React, { useState, useEffect, useRef } from "react";
import { Edit3, Trash2, Loader2, Play, GripVertical, FileText, Link as LinkIcon, HelpCircle, BookOpen, CheckCircle2, Plus } from "lucide-react";
import CreateQuizDialog from "../quiz/CreateQuizDialog";
import EditQuizDialog from "../quiz/EditQuizDialog";
import DeleteQuizDialog from "../quiz/DeleteQuizDialog";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

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
import { useReorderLinks } from "../../hooks/useLessson";
import useDeleteFromDropbox from "../../hooks/lessons/useDeleteFromDropbox";
import useEditFromDropbox from "../../hooks/lessons/useEditFromDropbox";
import useEditPdf from "../../hooks/lessons/useEditPdf";
import { useDeletePdf } from "../../hooks/lessons/useDeletePdf";
import useDeleteFromYoutube from "../../hooks/lessons/useDeleteFromYoutube";
import useEditFromYoutube from "../../hooks/lessons/useEditFromYoutube";
import { useUploadToYoutube } from "../../hooks/lessons/useUploadToYoutube";
import useEditLink from "../../hooks/lessons/useEditLink";
import useDeleteLink from "../../hooks/lessons/useDeleteLink";

import UploadActions from "../lessons/UploadActions";
import LessonList from "../lessons/LessonList";
import LinkList from "../lessons/LinkList";
import PdfViewer from "../PdfViewer";
import EmbedYt from "../EmbedYt";
import VideoPlayer from "../videoPlayer";

// added: upload hook import
import { useUploadToDropbox } from "../../hooks/lessons/useUploadToDropbox";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteQuiz, usePublishQuiz } from "../../hooks/useQuizAPI";

// new import for modal
import DropboxUploadModal from "../lessons/DropboxUploadModal";
import YoutubeUploadModal from "../lessons/YoutubeUploadModal";
import PdfUploadModal from "../lessons/PdfUploadModal";
import LinkUploadModal from "../lessons/LinkUploadModal";

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
  isAdminView = false,
}) => {
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  // ref for triggering CreateQuizDialog
  const quizDialogTriggerRef = useRef(null);
  // ref for triggering EditQuizDialog
  const editQuizDialogTriggerRef = useRef(null);
  // file input + upload state (optional fallback if parent doesn't handle upload)
  const fileInputRef = useRef(null);
  const ytFileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [finalizing, setFinalizing] = useState(false);

  // store abort function returned by the upload mutation so we can cancel
  const abortRef = useRef(null);
  const abortYoutubeRef = useRef(null);
  const queryClient = useQueryClient();
  const [uploadingYt, setUploadingYt] = useState(false);
  const [uploadProgressYt, setUploadProgressYt] = useState(0);
  const [finalizingYt, setFinalizingYt] = useState(false);

  // local lessons and rollback ref for smooth drag (match module behaviour)
  const [localLessons, setLocalLessons] = useState([]);
  const prevLessonsRef = useRef(null);

  // local links and rollback ref for smooth drag
  const [localLinks, setLocalLinks] = useState([]);
  const prevLinksRef = useRef(null);

  // active id + overlay size
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeLinkId, setActiveLinkId] = useState(null);

  // Quiz delete dialog state
  const [deleteQuizOpen, setDeleteQuizOpen] = useState(false);

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

  // sync server links into localLinks (sorted by position)
  useEffect(() => {
    const links = moduleData?.module?.links || [];
    const sorted = links.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    setLocalLinks(sorted);
  }, [moduleData?.module?.links]);
 
  // modal state for internal dropbox uploader
  const [showDropboxModal, setShowDropboxModal] = useState(false);
  // modal state for internal youtube uploader
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  // modal state for internal pdf uploader
  const [showPdfModal, setShowPdfModal] = useState(false);
  // modal state for internal link uploader
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  // open hidden file picker
  const openDropboxPicker = () => {
    // prefer modal for nicer UX
    setShowDropboxModal(true);
    // keep legacy hidden input for fallback
    // fileInputRef.current?.click();
  };

  // open hidden file picker for YouTube upload (prefers parent handler)
  const openYoutubePicker = () => {
    if (typeof onUploadYoutube === "function") {
      try {
        return onUploadYoutube(item);
      } catch {
        // fallthrough to internal picker
      }
    }
    // show internal YouTube modal fallback instead of opening file picker directly
    setShowYoutubeModal(true);
  };
 
  // open internal PDF modal (prefers parent handler)
  const openPdfPicker = () => {
    if (typeof onUploadPdf === "function") {
      try {
        return onUploadPdf(item);
      } catch {
        // fallthrough to internal modal
      }
    }
    setShowPdfModal(true);
  };

  // open internal link modal (prefers parent handler)
  const openLinkModal = () => {
    if (typeof onAddLink === "function") {
      try {
        return onAddLink(item);
      } catch {
        // fallthrough to internal modal
      }
    }
    setShowLinkModal(true);
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

  const handleYoutubeFiles = async (e) => {
    const files = e?.target?.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setUploadingYt(true);
    setUploadProgressYt(0);
    setFinalizingYt(false);

    try {
      const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      abortYoutubeRef.current = () => {
        try {
          if (typeof cancelUploadYoutube === "function") cancelUploadYoutube(uploadId);
        } catch { /* ignore */ }
      };

      await uploadYoutubeAsync({
        files,
        moduleId,
        uploadId,
        onProgress: (p) => {
          if (p >= 100) setFinalizingYt(true);
          setUploadProgressYt(p);
        },
      });

      if (moduleId) queryClient.invalidateQueries({ queryKey: ["module", moduleId] });
    } catch (err) {
      console.error("YouTube upload failed", err);
      throw err;
    } finally {
      abortYoutubeRef.current = null;
      setUploadingYt(false);
      setFinalizingYt(false);
      if (e && e.target) e.target.value = "";
      setTimeout(() => setUploadProgressYt(0), 600);
    }
  };

  const handleCancelYoutubeUpload = () => {
    if (abortYoutubeRef.current && typeof abortYoutubeRef.current === "function") {
      try {
        abortYoutubeRef.current();
      } catch (e) {
        console.warn("Failed to abort YouTube upload", e);
      } finally {
        abortYoutubeRef.current = null;
        setUploadingYt(false);
        setUploadProgressYt(0);
        setFinalizingYt(false);
      }
      return;
    }

    try {
      if (typeof cancelUploadYoutube === "function") {
        console.warn("No upload-specific abort available; call cancelUploadYoutube(uploadId) if you have the id");
      }
    } catch { /* ignore */ }
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
  const reorderLinksMutation = useReorderLinks(moduleId);

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

  // Delete quiz mutation
  const deleteQuizMutation = useDeleteQuiz();
  const publishQuizMutation = usePublishQuiz();

  const handleDeleteQuiz = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    setDeleteQuizOpen(true);
  };

  const handleConfirmDeleteQuiz = (quiz) => {
    if (!quiz?.id) return;
    
    deleteQuizMutation.mutate(quiz.id, {
      onSuccess: () => {
        toast.success("Quiz deleted successfully", {
          autoClose: 3000,
          pauseOnHover: true,
        });
        queryClient.invalidateQueries({ queryKey: ["module", moduleId] });
        setDeleteQuizOpen(false);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || 
                           error?.message || 
                           "Failed to delete quiz. Please try again.";
        toast.error(errorMessage, {
          autoClose: 4000,
          pauseOnHover: true,
        });
        console.error("Delete quiz error:", error);
      },
    });
  };

  const handlePublishQuiz = (e) => {
    e?.stopPropagation?.();
    const quiz = moduleData?.module?.quiz;
    if (!quiz) return;
    
    const newState = !quiz.isPublished;
    const action = newState ? "published" : "unpublished";
    
    publishQuizMutation.mutate(
      { quizId: quiz.id, moduleId },
      {
        onSuccess: () => {
          toast.success(`Quiz ${action} successfully`, {
            autoClose: 3000,
            pauseOnHover: true,
          });
        },
        onError: (error) => {
          const errorMessage = error?.response?.data?.message || 
                             "Failed to update quiz status. Please try again.";
          toast.error(errorMessage, {
            autoClose: 4000,
            pauseOnHover: true,
          });
        },
      }
    );
  };

  // pass moduleId so hook can optimistic-update the correct cache
  const {
    mutateAsync: editDropboxLessonAsync,
    isPending: editDropboxPending
  } = useEditFromDropbox(moduleId);

  const {
    mutateAsync: editYoutubeLessonAsync,
    isPending: editYoutubePending
  } = useEditFromYoutube(moduleId);

  const {
    mutateAsync: editPdfLessonAsync,
    isPending: editPdfPending
  } = useEditPdf(moduleId);

  const {
    mutateAsync: editLinkLessonAsync,
    isPending: editLinkPending
  } = useEditLink(moduleId);

  const {
    mutateAsync: deleteDropboxLessonAsync
  } = useDeleteFromDropbox(moduleId);

  const {
    mutateAsync: deleteYoutubeLessonAsync
  } = useDeleteFromYoutube(moduleId);
  
  const {
    mutateAsync: deletePdfLessonAsync,
  } = useDeletePdf(moduleId);

  const {
    mutateAsync: deleteLinkLessonAsync,
  } = useDeleteLink(moduleId);

  // upload hook (matches edit/delete pattern: returns mutateAsync + cancelUpload)
  const { mutateAsync: uploadDropboxAsync, cancelUpload, isLoading: uploadDropboxPending } = useUploadToDropbox();
  const { mutateAsync: uploadYoutubeAsync, cancelUpload: cancelUploadYoutube, isLoading: uploadYoutubePending } = useUploadToYoutube();

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

    if (type === "YOUTUBE") {
      return editYoutubeLessonAsync({ lessonId: lesson.id, title: newTitle, type: lesson.type }).catch((err) => {
        console.error("Failed to edit YouTube lesson:", err);
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

    // Delete YouTube lessons via hook (optimistic update handled in hook)
    if (String(lesson?.type || "").toUpperCase() === "YOUTUBE") {
      try {
        await deleteYoutubeLessonAsync({ lessonId: lesson.id, type: lesson.type });
        return;
      } catch (err) {
        console.error("Failed to delete YouTube lesson:", err);
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

  // Link handlers
  const handleEditLinkLocal = async (link, e, newTitle, newDescription, newUrl) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();

    return editLinkLessonAsync({
      linkId: link.id,
      title: newTitle,
      description: newDescription,
      url: newUrl
    }).catch((err) => {
      console.error("Failed to edit link:", err);
      throw err;
    });
  };

  const handleDeleteLinkLocal = async (link, e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();

    try {
      await deleteLinkLessonAsync({ linkId: link.id });
      return;
    } catch (err) {
      console.error("Failed to delete link:", err);
      throw err;
    }
  };

  // Drag handlers: match module behaviour (update local order on drag END)
  const handleDragStart = (event) => {
    const id = event.active?.id;
    setActiveLessonId(id || null);
    prevLessonsRef.current = localLessons.slice();
  };

  const handleDragEnd = (event) => {
    setActiveLessonId(null);

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

  // Link drag handlers
  const handleLinkDragStart = (event) => {
    const id = event.active?.id;
    setActiveLinkId(id || null);
    prevLinksRef.current = localLinks.slice();
  };

  const handleLinkDragEnd = (event) => {
    setActiveLinkId(null);

    const { active, over } = event;
    if (!active || !over) return;
    if (active.id === over.id) return;

    const oldIndex = localLinks.findIndex((l) => l.id === active.id);
    const newIndex = localLinks.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // compute new order and immediately apply locally
    const next = arrayMove(localLinks, oldIndex, newIndex);
    setLocalLinks(next);

    // prepare orderedLinks payload (1-based positions)
    const orderedLinks = next.map((l, idx) => ({ id: l.id, position: idx + 1 }));

    // call mutation with rollback on error
    reorderLinksMutation.mutate({ orderedLinks }, {
      onError: () => {
        if (prevLinksRef.current) setLocalLinks(prevLinksRef.current);
      },
      onSettled: () => {
        prevLinksRef.current = null;
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
      <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
        {moduleData.module.description ? (
          <p className="text-sm text-muted-foreground break-words leading-relaxed">{moduleData.module.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description</p>
        )}

        {!isAdminView && (
          <UploadActions
            onUploadYoutube={() => {
              // prefer parent handler; fallback to internal picker
              if (typeof onUploadYoutube === "function") return onUploadYoutube(item);
              return openYoutubePicker();
            }}
            // prefer parent handler (same format as edit/delete). if none, fall back to internal picker.
            onUploadDropbox={() => {
              if (typeof onUploadDropbox === "function") return onUploadDropbox(item);
              return openDropboxPicker();
            }}
            onPasteLink={() => onPasteLink?.(item)}
            onUploadPdf={() => {
              if (typeof onUploadPdf === "function") return onUploadPdf(item);
              return openPdfPicker();
            }}
            onAddLink={() => openLinkModal()}
          />
        )}

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
        {/* hidden file input for YouTube uploads (fallback) */}
        <input
          ref={ytFileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleYoutubeFiles}
          style={{ display: "none" }}
          disabled={uploadingYt}
        />
 
        {uploading && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">Uploading…</div>
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 text-xs rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
                onClick={handleCancelUpload}
                disabled={finalizing || uploadDropboxPending}
              >
                Cancel
              </button>
            </div>
            {uploadDropboxPending && <div className="text-xs text-muted-foreground">Finalizing upload...</div>}
          </div>
        )}

        {/* YouTube upload state UI (internal fallback) */}
        {uploadingYt && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">Uploading to YouTube…</div>
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 text-xs rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
                onClick={handleCancelYoutubeUpload}
                disabled={finalizingYt || uploadYoutubePending}
              >
                Cancel
              </button>
            </div>
            {uploadYoutubePending && <div className="text-xs text-muted-foreground">Finalizing upload...</div>}
          </div>
        )}

        {lessons.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="w-full overflow-hidden">
                <LessonList
                  lessons={lessons}
                  activeLessonId={activeLessonId}
                  formatDuration={formatDuration}
                  onPlayLesson={handlePlayLesson}
                  onEditLesson={handleEditLessonLocal}
                  onDeleteLesson={handleDeleteLessonLocal}
                  editPending={Boolean(editDropboxPending || editPdfPending || editYoutubePending)}
                  isAdminView={isAdminView}
                />
              </div>
            </SortableContext>

            <DragOverlay>
              {activeLessonId ? (() => {
                const active = lessons.find(l => l.id === activeLessonId);
                return active ? (
                  <div className="w-full max-w-full p-2 xs:p-2.5 sm:p-2.5 md:p-3 rounded-lg border-2 bg-card shadow-lg border-input">
                    <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2 md:gap-3 w-full max-w-full overflow-hidden">
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <div className="flex-shrink-0 w-8 xs:w-10 sm:w-10 md:w-12 h-8 xs:h-10 sm:h-10 md:h-12 p-1 sm:p-2 rounded-md flex items-center justify-center">
                          <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="hidden sm:flex relative flex-shrink-0 w-10 h-8 sm:w-14 sm:h-10 md:w-20 md:h-14 rounded-md overflow-hidden bg-muted items-center justify-center">
                        {active.type && String(active.type).toLowerCase() === "pdf" ? (
                          <img src="/pdf.png" alt="PDF" className="w-full h-full object-contain" />
                        ) : active.thumbnail ? (
                          <img src={active.thumbnail} alt={active.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-start gap-1.5 xs:gap-2 sm:gap-2 md:gap-3">
                          <span className="text-xs xs:text-xs sm:text-sm md:text-sm font-semibold text-primary bg-primary/10 px-1.5 xs:px-2 sm:px-2 py-0.5 rounded-full flex-shrink-0 leading-none">
                            {/* Position will be set by parent */}
                          </span>
                          <div className="flex-1 overflow-hidden">
                            <h6 className="line-clamp-1 text-xs xs:text-sm sm:text-sm font-semibold leading-tight text-foreground break-words overflow-hidden text-ellipsis">
                              {active.title}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })() : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="w-full overflow-hidden">
            <LessonList
              lessons={lessons}
              activeLessonId={activeLessonId}
              formatDuration={formatDuration}
              onPlayLesson={handlePlayLesson}
              onEditLesson={handleEditLessonLocal}
              onDeleteLesson={handleDeleteLessonLocal}
              editPending={Boolean(editDropboxPending || editPdfPending || editYoutubePending)}
              isAdminView={isAdminView}
            />
          </div>
        )}

        {/* Links Section */}
        {localLinks.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleLinkDragStart}
            onDragEnd={handleLinkDragEnd}
          >
            <SortableContext items={localLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="w-full overflow-hidden">
                <LinkList
                  links={localLinks}
                  onEditLink={handleEditLinkLocal}
                  onDeleteLink={handleDeleteLinkLocal}
                  editPending={Boolean(editLinkPending)}
                  isAdminView={isAdminView}
                />
              </div>
            </SortableContext>

            <DragOverlay>
              {activeLinkId ? (() => {
                const active = localLinks.find(l => l.id === activeLinkId);
                return active ? (
                  <div className="w-full max-w-full p-2 xs:p-2.5 sm:p-2.5 md:p-3 rounded-lg border-2 bg-card shadow-lg border-input">
                    <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2 md:gap-3 w-full max-w-full overflow-hidden">
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <div className="flex-shrink-0 w-8 xs:w-10 sm:w-10 md:w-12 h-8 xs:h-10 sm:h-10 md:h-12 p-1 sm:p-2 rounded-md flex items-center justify-center">
                          <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="hidden sm:flex relative flex-shrink-0 w-10 h-8 sm:w-14 sm:h-10 md:w-20 md:h-14 rounded-md overflow-hidden bg-blue-100 items-center justify-center">
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                          <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-start gap-1.5 xs:gap-2 sm:gap-2 md:gap-3">
                          <span className="text-xs xs:text-xs sm:text-sm md:text-sm font-semibold text-primary bg-primary/10 px-1.5 xs:px-2 sm:px-2 py-0.5 rounded-full flex-shrink-0 leading-none">
                            {/* Position will be set by parent */}
                          </span>
                          <div className="flex-1 overflow-hidden">
                            <h6 className="line-clamp-1 text-xs xs:text-sm sm:text-sm font-semibold leading-tight text-foreground break-words overflow-hidden text-ellipsis">
                              {active.title}
                            </h6>
                            {active.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {active.description}
                              </p>
                            )}
                            <p className="text-xs text-blue-600 line-clamp-1 mt-0.5 break-all">
                              {active.url}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })() : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="w-full overflow-hidden">
            <LinkList
              links={localLinks}
              activeLinkId={activeLinkId}
              onEditLink={handleEditLinkLocal}
              onDeleteLink={handleDeleteLinkLocal}
              editPending={Boolean(editLinkPending)}
              isAdminView={isAdminView}
            />
          </div>
        )}

        {/* Quiz Section */}
        <div className="space-y-3">
          <h4 className="text-sm md:text-base font-semibold text-foreground">Quiz</h4>
          {moduleData.module.quiz ? (
            <Card className="w-full border-2">
              <CardHeader className="">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg text-foreground">
                      {moduleData.module.quiz.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center justify-end gap-2 flex-shrink-0 w-40">
                    {!isAdminView && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-primary hover:bg-primary/10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            editQuizDialogTriggerRef.current?.click();
                          }}
                          title="Edit quiz"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={handleDeleteQuiz}
                          disabled={deleteQuizMutation.isPending}
                          title="Delete quiz"
                          aria-label="Delete quiz"
                        >
                          {deleteQuizMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant={moduleData.module.quiz.isPublished ? "outline" : "default"}
                          onClick={handlePublishQuiz}
                          disabled={publishQuizMutation.isPending}
                          title={moduleData.module.quiz.isPublished ? "Click to unpublish quiz" : "Click to publish quiz"}
                          aria-label={moduleData.module.quiz.isPublished ? "Unpublish quiz" : "Publish quiz"}
                          className={`transition-all duration-200 ${
                            publishQuizMutation.isPending
                              ? "opacity-70 cursor-not-allowed"
                              : moduleData.module.quiz.isPublished
                              ? "text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          }`}
                        >
                          {publishQuizMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                              <span className="hidden sm:inline">Processing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1.5" />
                              <span className="hidden sm:inline">
                                {moduleData.module.quiz.isPublished ? "Unpublish" : "Publish"}
                              </span>
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              {moduleData.module.quiz.description && (
                <div className="px-6">
                  <span className="font-medium text-sm">Description:</span>
                  <p className="text-xs md:text-sm mt-1 text-muted-foreground whitespace-pre-wrap break-words">
                    {moduleData.module.quiz.description}
                  </p>
                </div>
              )}

              <CardContent className="space-y-4">
                {/* Quiz Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Total Questions */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Questions</p>
                    <p className="text-lg md:text-xl font-bold text-foreground">
                      {moduleData.module.quiz.questions?.length || 0}
                    </p>
                  </div>

                  {/* Total Points */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Total Points</p>
                    <p className="text-lg md:text-xl font-bold text-foreground">
                      {moduleData.module.quiz.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0}
                    </p>
                  </div>

                  {/* Time Limit */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Time Limit</p>
                    <p className="text-lg md:text-xl font-bold text-foreground">
                      {moduleData.module.quiz.timeLimit && moduleData.module.quiz.timeLimit > 0
                        ? `${Math.floor(moduleData.module.quiz.timeLimit / 60)}m`
                        : "Unlimited"}
                    </p>
                  </div>

                  {/* Attempt Limit */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Attempts</p>
                    <p className="text-lg md:text-xl font-bold text-foreground">
                      {moduleData.module.quiz.attemptLimit || "∞"}
                    </p>
                  </div>
                </div>

                {/* Last Updated */}
                {moduleData.module.quiz.updatedAt && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Last updated:</span>
                      <span className="ml-1">
                        {new Date(moduleData.module.quiz.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Questions Summary */}
                {moduleData.module.quiz.questions && moduleData.module.quiz.questions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-medium text-muted-foreground">Question Types</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        moduleData.module.quiz.questions.reduce((acc, q) => {
                          acc.set(q.type, (acc.get(q.type) || 0) + 1);
                          return acc;
                        }, new Map())
                      ).map(([type, count]) => {
                        const getTypeLabel = (t) => {
                          switch (String(t).toUpperCase()) {
                            case 'MULTIPLE_CHOICE':
                              return 'Multiple Choice';
                            case 'TRUE_FALSE':
                              return 'True/False';
                            case 'IDENTIFICATION':
                              return 'Identification';
                            default:
                              return String(t).replace(/_/g, ' ');
                          }
                        };
                        return (
                          <div
                            key={type}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {getTypeLabel(type)}
                            <span className="text-primary/70">({Number(count) || 0})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full border-2 border-dashed border-border">
              <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="rounded-full bg-green-100 p-4 mb-4">
                  <HelpCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  No quiz yet
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-sm mb-4">
                  Create a quiz to test student knowledge.
                </p>
                {!isAdminView && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      quizDialogTriggerRef.current?.click();
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Quiz
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    );
  };

  // Set body cursor during drag
  useEffect(() => {
    if (moduleIsDragging) {
      document.body.style.cursor = 'grabbing';
      return () => {
        document.body.style.cursor = '';
      };
    }
  }, [moduleIsDragging]);

  // Keep module header non-draggable here (module-level drag handled elsewhere)
  const style = {
    transform: moduleTransform ? CSS.Transform.toString(moduleTransform) : undefined,
    transition: moduleTransition,
    opacity: moduleIsDragging ? 0.75 : 1,
  };

  const lessonsForPlayer = localLessons || [];
  const currentLesson = lessonsForPlayer[currentLessonIndex];

  return (
    <>
      <div
        ref={setModuleNodeRef}
        className="relative rounded-lg border-2 bg-card shadow-lg hover:shadow-xl border-input transition-all duration-200 hover:border-primary/30 w-full overflow-clip"
        style={style}
      >
        <AccordionItem
          value={item.id}
          key={item.id}
          className="border-0"
        >
          <AccordionTrigger className="group py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-6 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 hover:bg-accent/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]]:border-b [&[data-state=open]]:border-border w-full overflow-hidden [&>svg]:hidden">
          <div
            className="flex-shrink-0 mr-2 sm:mr-3 p-1 rounded cursor-pointer active:cursor-grabbing touch-none select-none hover:bg-accent/30 transition-colors"
            {...(listenersDisabled ? {} : { ...moduleAttributes })}
            {...(listenersDisabled ? {} : { ...moduleListeners })}
            style={{ touchAction: "none" }}
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </div>

          <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2 sm:pr-3 md:pr-40 overflow-hidden">
            <div className="text-xs sm:text-sm md:text-base font-semibold leading-tight text-left overflow-hidden">
              <span className="text-xs sm:text-xs md:text-sm flex-shrink-0 mr-1">Module {item.position}:</span>
              <span className="block overflow-hidden text-ellipsis" title={item.title}>{item.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-sm text-muted-foreground whitespace-nowrap max-w-[5.5rem] overflow-hidden truncate flex-shrink-0 hidden md:block">
              {(item._count?.lessons ?? 0) + (item._count?.attachments ?? 0)} lessons
            </div>

            <div className={`flex items-center gap-2 transition-all duration-200 opacity-100 scale-100`} onClick={(e) => e.stopPropagation()}>
              {!isAdminView && (
                <>
                  <div role="button" tabIndex={0} title="Edit module" className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}>
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <div role="button" tabIndex={0} title="Delete module" className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); onDelete?.(item); }}>
                    <Trash2 className="h-4 w-4" />
                  </div>
                </>
              )}
            </div>

            {/* Custom Arrow Button */}
            <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
              <svg
                className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 bg-gradient-to-b from-muted/20 to-transparent w-full overflow-hidden">
          {renderModuleContent()}
        </AccordionContent>
      </AccordionItem>
      </div>

      {/* modal instance (open when user triggers upload and parent didn't handle upload) */}
      <DropboxUploadModal open={showDropboxModal} onClose={() => setShowDropboxModal(false)} moduleId={moduleId} />
      <YoutubeUploadModal open={showYoutubeModal} onClose={() => setShowYoutubeModal(false)} moduleId={moduleId} />
      <PdfUploadModal open={showPdfModal} onClose={() => setShowPdfModal(false)} moduleId={moduleId} />
      <LinkUploadModal open={showLinkModal} onClose={() => setShowLinkModal(false)} moduleId={moduleId} />
      
      <CreateQuizDialog 
        moduleId={moduleId} 
        onSuccess={() => {
          queryClient.invalidateQueries(["module", moduleId]);
        }}
        trigger={
          <div 
            ref={quizDialogTriggerRef}
            style={{ display: 'none' }}
          />
        }
      />

      <EditQuizDialog 
        quiz={moduleData?.module?.quiz}
        onSuccess={() => {
          queryClient.invalidateQueries(["module", moduleId]);
        }}
        trigger={
          <div 
            ref={editQuizDialogTriggerRef}
            style={{ display: 'none' }}
          />
        }
      />

      <DeleteQuizDialog
        open={deleteQuizOpen}
        onOpenChange={setDeleteQuizOpen}
        quiz={moduleData?.module?.quiz}
        onConfirm={handleConfirmDeleteQuiz}
        isLoading={deleteQuizMutation.isPending}
      />

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
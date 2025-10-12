import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Play, Edit3, Trash2, MoreHorizontal, Link as LinkIcon } from "lucide-react";
import { DeleteLessonDialog, EditLessonDialog } from "./LessonDialog"; // <-- import here
import { formatDuration } from "../../lib/utils";

const SortableLesson = ({ lesson, index, onPlayLesson, onEditLesson, onDeleteLesson, editPending = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });

  // Ref to title node so we can read computed font-size when drag begins
  const titleRef = useRef(null);
  const [lockedFontSize, setLockedFontSize] = useState(null);

  // menu state for small screens
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const menuDivRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // edit dialog state
  const [editOpen, setEditOpen] = useState(false);

  // menu position for fixed positioning
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // thumbnail error state
  const [thumbnailError, setThumbnailError] = useState(false);

  // ensure only one lesson menu is open at a time across the list:
  // when this instance opens it will dispatch "lesson-menu-open" with its id,
  // other instances listen and will close if the id doesn't match.
  useEffect(() => {
    const onExternalOpen = (e) => {
      if (e?.detail !== lesson.id) setMenuOpen(false);
    };
    document.addEventListener("lesson-menu-open", onExternalOpen);
    return () => document.removeEventListener("lesson-menu-open", onExternalOpen);
  }, [lesson.id]);

  // reset thumbnail error when lesson changes
  useEffect(() => {
    setThumbnailError(false);
  }, [lesson.thumbnail]);
  // close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if ((menuRef.current && menuRef.current.contains(e.target)) || (menuDivRef.current && menuDivRef.current.contains(e.target))) {
        return;
      }
      setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  // calculate menu position when menu opens
  useLayoutEffect(() => {
    if (menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 160; // approximate width of menu (w-40)
      const menuHeight = 80; // approximate height

      let left = rect.right + window.scrollX + 4;
      let top = rect.top + window.scrollY;

      // Adjust horizontal position if menu would go off-screen to the right
      if (left + menuWidth > window.innerWidth + window.scrollX) {
        left = rect.left + window.scrollX - menuWidth - 4;
      }

      // Adjust vertical position if menu would go off-screen to the bottom
      if (top + menuHeight > window.innerHeight + window.scrollY) {
        top = rect.bottom + window.scrollY - menuHeight;
      }

      setMenuPosition({ top, left });
    }
  }, [menuOpen]);

  // Lock computed font-size while dragging to avoid visual jump on small screens
  useLayoutEffect(() => {
    if (isDragging) {
      try {
        const el = titleRef.current;
        if (el) {
          const fs = window.getComputedStyle(el).fontSize;
          if (fs) setLockedFontSize(fs);
        }
      } catch {
        setLockedFontSize(null);
      }
    } else {
      setLockedFontSize(null);
    }
  }, [isDragging]);

  // Set body cursor during drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
      return () => {
        document.body.style.cursor = '';
      };
    }
  }, [isDragging]);

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transform ? (transition ?? "transform 150ms ease") : undefined,
    willChange: transform ? "transform" : undefined,
    // allow vertical native scrolling on mobile
    touchAction: "pan-y",
    width: "100%",
    zIndex: "auto",
    opacity: 1,
    // lock font-size while dragging (prevents jump)
    fontSize: lockedFontSize || undefined,
    // remove grab cursor from the entire card
    cursor: isDragging ? "grabbing" : "default"
  };

  return (
    <div
      ref={setNodeRef}
      data-lesson-id={lesson.id}
      style={style}
      className={`relative w-full max-w-full p-2 xs:p-2.5 sm:p-2.5 md:p-3 rounded-lg border-2 bg-card shadow-sm sm:shadow-md border-input transition-colors duration-150 hover:shadow-lg hover:border-primary/30 ${menuOpen ? "overflow-visible" : "overflow-hidden"} box-border`}
      onClick={(e) => {
        // if click originates from an interactive child (menu/buttons/etc.) do not play
        if (e.target && (e.target.closest("button, a, input, textarea, select") || e.target.closest("[data-no-play]"))) {
          return;
        }
        onPlayLesson?.(index);
      }}
    >
      <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2 md:gap-3 w-full max-w-full overflow-hidden">
        {/* Drag handle and actions grouped together */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Drag handle - keep touchAction none only on the handle so dragging starts from it */}
          <div
            {...attributes}
            {...listeners}
            style={{ touchAction: "none" }}
            className="flex-shrink-0 w-8 xs:w-10 sm:w-10 md:w-12 h-8 xs:h-10 sm:h-10 md:h-12 p-1 sm:p-2 rounded-md select-none hover:bg-accent/20 transition-colors flex items-center justify-center cursor-pointer active:cursor-grabbing"
            title="Drag to reorder"
            aria-label="drag-handle"
          >
            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </div>

          {/* actions - mark actions area so card-click ignores clicks that start here
              and allow dropdown to overflow outside the card (not clipped) */}
          <div
            data-no-play="true"
            className="flex items-center gap-0.5 overflow-visible"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Small screen: single modern menu button -> dropdown */}
            <div className="hidden relative" ref={menuRef} onPointerDown={(e)=>e.stopPropagation()}>
              <button
                ref={buttonRef}
                type="button"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                className="h-8 w-8 p-1 flex items-center justify-center rounded-md hover:bg-primary/10 transition-colors bg-white/5 touch-manipulation"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  // toggle locally; when opening, broadcast so others close
                  setMenuOpen((prev) => {
                    const next = !prev;
                    console.log("lesson-menu-open", lesson.id);
                    
                    if (next) {
                      document.dispatchEvent(new CustomEvent("lesson-menu-open", { detail: lesson.id }));
                    }
                    return next;
                  });
                }}
                title="Actions"
              >
                <MoreHorizontal className="h-4 w-4 text-foreground" />
              </button>

              {menuOpen && (
                <div
                  ref={menuDivRef}
                  role="menu"
                  aria-label="Lesson actions"
                  className="absolute w-40 bg-slate-100 dark:bg-slate-800 text-foreground rounded-md shadow-lg ring-1 ring-black/10 overflow-hidden z-[9999]"
                  style={{ top: menuPosition.top, left: menuPosition.left }}
                  onPointerDown={(e) => e.stopPropagation()} /* keep pointer events inside the dropdown from bubbling */
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-muted/10"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setEditOpen(true); }}
                  >
                    <Edit3 className="h-4 w-4 text-primary" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-muted/10 text-destructive"
                    onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Desktop / tablet: separate edit & delete buttons */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="edit-lesson"
                className="h-8 w-8 p-1 flex items-center justify-center rounded-md hover:bg-primary/10 hover:text-primary transition-colors touch-manipulation"
                onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
              >
                <Edit3 className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label="delete-lesson"
                className="h-8 w-8 p-1 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors touch-manipulation"
                onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* thumbnail / icon - hidden on very small screens, visible from sm+ */}
        <div className="hidden sm:flex relative flex-shrink-0 w-10 h-8 sm:w-14 sm:h-10 md:w-20 md:h-14 rounded-md overflow-hidden bg-muted items-center justify-center group">
          {lesson.type && String(lesson.type).toLowerCase() === "pdf" ? (
            <img src="/pdf.png" alt="PDF" className="w-full h-full object-contain" />
          ) : lesson.type && String(lesson.type).toLowerCase() === "link" ? (
            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
              <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </div>
          ) : lesson.thumbnail && !thumbnailError ? (
            <>
              <img 
                src={lesson.thumbnail} 
                alt={lesson.title} 
                className="w-full h-full object-cover" 
                onError={() => setThumbnailError(true)}
              />
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white drop-shadow-lg" />
              </div>
              {/* Duration overlay */}
              {lesson.duration && lesson.duration > 0 && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded font-medium">
                  {formatDuration(lesson.duration)}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
          )}
        </div>

        {/* title / meta */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-start gap-1.5 xs:gap-2 sm:gap-2 md:gap-3">
            <span className="text-xs xs:text-xs sm:text-sm md:text-sm font-semibold text-primary bg-primary/10 px-1.5 xs:px-2 sm:px-2 py-0.5 rounded-full flex-shrink-0 leading-none">
              {index + 1}
            </span>
            <div className="flex-1 overflow-hidden">
              <h6
                ref={titleRef}
                className="line-clamp-1 text-xs xs:text-sm sm:text-sm font-semibold leading-tight text-foreground break-words overflow-hidden text-ellipsis"
              >
                {lesson.title}
              </h6>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <DeleteLessonDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={onDeleteLesson}
        lesson={lesson}
        isLoading={false} // pass mutation.isLoading if needed
      />

      {/* Edit dialog (opens locally, onSave calls parent handler) */}
      <EditLessonDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        lesson={lesson}
        isLoading={editPending}
        onConfirm={async (l, newTitle) => {
          // call the passed handler and if it returns a promise, await it
          const p = onEditLesson?.(l, null, newTitle);
          if (p && typeof p.then === "function") {
            // keep dialog open while pending; close on success
            try {
              await p;
              setEditOpen(false);
            } catch (err) {
              // leave dialog open so user can see error; optionally show toast
              console.error("Edit failed:", err);
            }
          } else {
            // synchronous or no-return path — close immediately
            setEditOpen(false);
          }
         }}
      />
    </div>
  );
};

export default SortableLesson;
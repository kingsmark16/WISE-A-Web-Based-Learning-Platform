import React, { useRef, useState, useLayoutEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Play, Edit3, Trash2 } from "lucide-react";

const SortableLesson = ({ lesson, index, formatDuration, onPlayLesson, onEditLesson, onDeleteLesson }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });

  // Ref to title node so we can read computed font-size when drag begins
  const titleRef = useRef(null);
  const [lockedFontSize, setLockedFontSize] = useState(null);

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

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transform ? (transition ?? "transform 150ms ease") : undefined,
    willChange: transform ? "transform" : undefined,
    // allow vertical native scrolling on mobile
    touchAction: "pan-y",
    width: "100%",
    zIndex: isDragging ? 99999 : "auto",
    opacity: 1,
    // lock font-size while dragging (prevents jump)
    fontSize: lockedFontSize || undefined
  };

  return (
    <div
      ref={setNodeRef}
      data-lesson-id={lesson.id}
      style={style}
      className="w-full p-1.5 sm:p-2 md:p-3 lg:p-4 cursor-pointer rounded-lg overflow-hidden border-2 bg-card shadow-sm sm:shadow-md border-input transition-colors duration-150 hover:shadow-lg hover:border-primary/30"
      onClick={() => onPlayLesson?.(index)}
    >
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
        {/* Drag handle - keep touchAction none only on the handle so dragging starts from it */}
        <div
          {...attributes}
          {...listeners}
          style={{ touchAction: "none" }}
          className="flex-shrink-0 mr-1 sm:mr-2 w-6 sm:w-8 md:w-8 p-1 rounded-md select-none hover:bg-accent/20 transition-colors flex items-center justify-center"
          title="Drag to reorder"
          aria-label="drag-handle"
        >
          <GripVertical className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground" />
        </div>

        {/* thumbnail / icon - hidden on very small screens, visible from sm+ */}
        <div className="hidden sm:flex relative flex-shrink-0 w-10 h-8 sm:w-14 sm:h-10 md:w-20 md:h-14 lg:w-24 lg:h-16 rounded-md overflow-hidden bg-muted items-center justify-center">
          {lesson.type && String(lesson.type).toLowerCase() === "pdf" ? (
            <img src="/pdf.png" alt="PDF" className="w-full h-full object-contain" />
          ) : lesson.thumbnail ? (
            <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
          )}

          {lesson.duration && formatDuration && !isDragging && (
            <div className="absolute bottom-0 right-0 text-xs px-1 sm:px-1.5 py-0.5 rounded-bl-md bg-black/70 text-white">
              {formatDuration(lesson.duration)}
            </div>
          )}
        </div>

        {/* title / meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm md:text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h6
                ref={titleRef}
                className="text-xs sm:text-sm md:text-base font-semibold leading-tight text-foreground break-words whitespace-normal"
              >
                {lesson.title}
              </h6>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 ml-1">
          <button
            type="button"
            aria-label="edit-lesson"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 p-1 sm:p-0 flex items-center justify-center rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={(e) => { e.stopPropagation(); onEditLesson?.(lesson, e); }}
          >
            <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </button>

          <button
            type="button"
            aria-label="delete-lesson"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 p-1 sm:p-0 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={(e) => { e.stopPropagation(); onDeleteLesson?.(lesson, e); }}
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortableLesson;
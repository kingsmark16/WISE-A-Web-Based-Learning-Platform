import React, { useState } from "react";
import { Edit3, Trash2, Loader2, Play, Youtube, Upload, Link, FileText, ExternalLink, PlusCircle, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGetModule } from "../../hooks/useModule";
import EmbedYt from "../EmbedYt";
import UploadActions from "../lessons/UploadActions";
import LessonList from "../lessons/LessonList";
import PdfViewerDialog from "../PdfViewer";
import PdfViewer from "../PdfViewer";
import VideoPlayer from "../videoPlayer"; // Make sure this import exists

const SortableModule = ({ 
  item, 
  listenersDisabled = false, 
  dragOverlay = false, 
  isOpen = false, 
  onEdit, 
  onDelete,
  onEditLesson,
  onDeleteLesson,
  onUploadYoutube,
  onUploadDropbox,
  onPasteLink,
  onUploadPdf,
  onAddLink,
  onCreateQuiz
}) => {
  // Add video player state
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: item.id 
  });
  
  // fetch detailed module data when opened
  const { data: moduleData, isLoading: moduleLoading, error: moduleError } = useGetModule(item.id, isOpen);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: listenersDisabled ? "default" : "grab",
    opacity: isDragging && !dragOverlay ? 0.75 : 1,
  };

  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return null;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Video player handlers
  const handlePlayLesson = (lessonIndex) => {
    setCurrentLessonIndex(lessonIndex);
    setVideoPlayerOpen(true);
  };

  const handleNextLesson = () => {
    const lessons = moduleData?.module?.lessons || [];
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  // Lesson action handlers
  const handleEditLesson = (lesson, event) => {
    event.stopPropagation();
    onEditLesson?.(lesson);
  };

  const handleDeleteLesson = (lesson, event) => {
    event.stopPropagation();
    onDeleteLesson?.(lesson);
  };

  // Upload action handlers
  const handleUploadYoutube = () => {
    onUploadYoutube?.(item);
  };

  const handleUploadDropbox = () => {
    onUploadDropbox?.(item);
  };

  const handlePasteLink = () => {
    onPasteLink?.(item);
  };

  const handleUploadPdf = () => {
    onUploadPdf?.(item);
  };

  const handleAddLink = () => {
    onAddLink?.(item);
  };

  const handleCreateQuiz = () => {
    onCreateQuiz?.(item);
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
      return (
        <div className="text-sm text-destructive">
          Failed to load module details
        </div>
      );
    }

    if (moduleData?.module) {
      const lessons = moduleData.module.lessons || [];
      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Description */}
          {moduleData.module.description ? (
            <p className="text-sm text-muted-foreground break-words leading-relaxed">{moduleData.module.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No description</p>
          )}

          {/* Upload Actions */}
          <UploadActions
            onUploadYoutube={handleUploadYoutube}
            onUploadDropbox={handleUploadDropbox}
            onPasteLink={handlePasteLink}
            onUploadPdf={handleUploadPdf}
            onAddLink={handleAddLink}
            onCreateQuiz={handleCreateQuiz}
          />

          {/* Video Lessons */}
          {lessons.length > 0 && (
            <LessonList
              lessons={lessons}
              formatDuration={formatDuration}
              onPlayLesson={handlePlayLesson}
              onEditLesson={handleEditLesson}
              onDeleteLesson={handleDeleteLesson}
            />
          )}

          {/* Quiz */}
          {moduleData.module.quiz && (
            <div>
              <h5 className="font-semibold text-base mb-2 sm:mb-3 flex items-center gap-2">
                <span className="text-teal-600 dark:text-teal-400">📝</span>
                Quiz
              </h5>
              <div className="p-3 sm:p-4 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/30">
                <div className="text-sm font-medium break-words text-teal-900 dark:text-teal-100">{moduleData.module.quiz.title}</div>
                {moduleData.module.quiz.description && (
                  <div className="text-xs text-teal-700 dark:text-teal-300 mt-2 break-words">
                    {moduleData.module.quiz.description}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3 text-xs text-teal-600 dark:text-teal-400">
                  {moduleData.module.quiz.timeLimit && (
                    <span className="bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded">
                      ⏱️ {moduleData.module.quiz.timeLimit} min
                    </span>
                  )}
                  {moduleData.module.quiz.questions && (
                    <span className="bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded">
                      ❓ {moduleData.module.quiz.questions} questions
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
            <div className="text-center sm:text-left">
              <div className="text-lg font-bold text-primary">{lessons.length}</div>
              <div className="text-xs text-muted-foreground">Video{lessons.length !== 1 ? 's' : ''}</div>
            </div>
            {moduleData.module.quiz && (
              <div className="text-center sm:text-left">
                <div className="text-lg font-bold text-teal-600">1</div>
                <div className="text-xs text-muted-foreground">Quiz</div>
              </div>
            )}
            {lessons.length > 0 && (
              <div className="text-center sm:text-left">
                <div className="text-lg font-bold text-green-600">
                  {formatDuration(
                    lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)
                  ) || '0:00'}
                </div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Fallback to basic info if no detailed data
    return (
      <div>
        {item.description ? (
          <p className="text-sm text-muted-foreground mb-3 break-words">{item.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic mb-3">No description</p>
        )}

        <div className="flex flex-col gap-2">
          <div className="text-sm truncate">
            <strong>{item._count?.lessons ?? 0}</strong> video lessons
          </div>
          <div className="text-sm truncate">
            <strong>{item._count?.attachments ?? 0}</strong> attachments
          </div>
        </div>
      </div>
    );
  };

  const lessons = moduleData?.module?.lessons || [];
  const currentLesson = lessons[currentLessonIndex];

  return (
    <>
      <AccordionItem
        ref={setNodeRef}
        value={item.id}
        key={item.id}
        // make sure the item never forces horizontal scrolling
        className="relative rounded-lg overflow-hidden border-2 bg-card shadow-lg hover:shadow-xl border-input transition-all duration-200 hover:border-primary/30 w-full min-w-0 overflow-x-hidden box-border"
        style={style}
        {...attributes}
      >
        <AccordionTrigger className="group py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-6 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 hover:bg-accent/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]]:border-b [&[data-state=open]]:border-border w-full min-w-0 overflow-hidden box-border">
          
           {/* Drag Handle for All Screen Sizes */}
           <div 
             className="flex-shrink-0 mr-2 sm:mr-3 p-1 rounded cursor-grab active:cursor-grabbing touch-none select-none hover:bg-accent/30 transition-colors"
             {...(listenersDisabled ? {} : listeners)}
             style={{ touchAction: 'none' }}
             onClick={(e) => e.stopPropagation()}
             title="Drag to reorder"
           >
             <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground transition-colors" />
           </div>
 
           {/* Main content area */}
           <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2 sm:pr-3 md:pr-40">
             <div className="text-xs sm:text-sm md:text-base font-semibold leading-tight text-left overflow-hidden min-w-0">
               <span className="text-xs sm:text-xs md:text-sm flex-shrink-0 mr-1">Module {item.position}:</span>
               {/* allow the title to wrap onto multiple lines and avoid overlapping the action buttons */}
               <span
                 className="block whitespace-wrap break-words overflow-hidden min-w-0"
                 title={item.title}
               >
                 {item.title}
               </span>
             </div>
             
             {/* Mobile: Show lesson count below title */}
             <div className="text-xs sm:text-sm text-muted-foreground sm:hidden">
               {(item._count?.lessons ?? 0) + (item._count?.attachments ?? 0)} lessons
             </div>
           </div>
 
           {/* Desktop: Lesson count and buttons area */}
           <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
             <div className="text-sm text-muted-foreground whitespace-nowrap max-w-[5.5rem] overflow-hidden truncate flex-shrink-0">
               {(item._count?.lessons ?? 0) + (item._count?.attachments ?? 0)} lessons
             </div>
             
             {/* Action buttons - only show when accordion is closed */}
             <div
               className={`flex items-center gap-2 transition-all duration-200 ${
                 isOpen ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
               }`}
               onClick={(e) => e.stopPropagation()}
               onPointerDown={(e) => e.stopPropagation()}
             >
               <div 
                 role="button"
                 tabIndex={0}
                 title="Edit module"
                 aria-label="Edit module" 
                 className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60"
                 onClick={(e) => { 
                   e.stopPropagation(); 
                   onEdit?.(item); 
                 }}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     e.stopPropagation();
                     onEdit?.(item);
                   }
                 }}
               >
                 <Edit3 className="h-4 w-4" />
               </div>
               <div 
                 role="button"
                 tabIndex={0}
                 title="Delete module"
                 aria-label="Delete module" 
                 className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-destructive/60"
                 onClick={(e) => { 
                   e.stopPropagation(); 
                   onDelete?.(item);
                 }}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     e.stopPropagation();
                     onDelete?.(item);
                   }
                 }}
               >
                 <Trash2 className="h-4 w-4" />
               </div>
             </div>
           </div>
 
           {/* Mobile: Action buttons */}
           <div
             className={`sm:hidden flex items-center gap-2 flex-shrink-0 transition-all duration-200 ${
               isOpen ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
             }`}
             onClick={(e) => e.stopPropagation()}
             onPointerDown={(e) => e.stopPropagation()}
             onTouchStart={(e) => e.stopPropagation()}
           >
             <div 
               role="button"
               tabIndex={0}
               title="Edit module"
               aria-label="Edit module" 
               className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60"
               onClick={(e) => { 
                 e.stopPropagation(); 
                 onEdit?.(item); 
               }}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   e.stopPropagation();
                   onEdit?.(item);
                 }
               }}
             >
               <Edit3 className="h-4 w-4" />
             </div>
             <div 
               role="button"
               tabIndex={0}
               title="Delete module"
               aria-label="Delete module" 
               className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-destructive/60"
               onClick={(e) => { 
                 e.stopPropagation(); 
                 onDelete?.(item);
               }}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   e.stopPropagation();
                   onDelete?.(item);
                 }
               }}
             >
               <Trash2 className="h-4 w-4" />
             </div>
           </div>
         </AccordionTrigger>
 
         <AccordionContent className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 bg-gradient-to-b from-muted/20 to-transparent">
           {renderModuleContent()}
         </AccordionContent>
       </AccordionItem>
 
      {/* Video Player */}
      {currentLesson && (
        <>
          {currentLesson.type === "PDF" ? (
            <PdfViewer
              open={videoPlayerOpen}
              onClose={() => setVideoPlayerOpen(false)}
              pdfUrl={currentLesson.url}
              title={currentLesson.title}
            />
          ) : currentLesson.type === "YOUTUBE" ? (
            <EmbedYt
              open={videoPlayerOpen}
              onOpenChange={setVideoPlayerOpen}
              lesson={currentLesson}
              onNext={handleNextLesson}
              onPrevious={handlePreviousLesson}
              hasNext={currentLessonIndex < lessons.length - 1}
              hasPrevious={currentLessonIndex > 0}
            />
          ) : (
            <VideoPlayer
              open={videoPlayerOpen}
              onClose={() => setVideoPlayerOpen(false)}
              url={currentLesson.url}
              title={currentLesson.title}
              onNext={handleNextLesson}
              onPrevious={handlePreviousLesson}
              hasNext={currentLessonIndex < lessons.length - 1}
              hasPrevious={currentLessonIndex > 0}
            />
          )}
        </>
      )}
    </>
  );
};

export default SortableModule;
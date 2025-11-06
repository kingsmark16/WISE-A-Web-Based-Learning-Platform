import React, { memo, useCallback } from 'react';
import { Play, FileText, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Individual lesson item component - memoized for performance
 */
const LessonItem = memo(({ lesson, onPlay, index, isCompleted = false }) => {
  const handleClick = useCallback(() => {
    if (typeof onPlay === 'function') {
      onPlay(lesson);
    }
  }, [lesson, onPlay]);

  const getLessonTypeLabel = () => {
    const type = String(lesson?.type || '').toUpperCase();
    if (type === 'YOUTUBE' || type === 'DROPBOX') return 'VIDEO';
    return type;
  };

  const getDurationDisplay = () => {
    if (!lesson?.duration) return null;
    const minutes = Math.floor(lesson.duration / 60);
    const seconds = lesson.duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <button
      onClick={handleClick}
      className='w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors group cursor-pointer text-left border-input bg-card hover:bg-accent/50'
    >
      {/* Lesson Number or Completion Check */}
      <div className='flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center'>
          <span className="text-xs font-semibold text-primary">{index + 1}</span>
      </div>

      {/* Thumbnail/Icon Section */}
      {lesson?.type?.toUpperCase() === 'PDF' ? (
        // PDF: Simple Icon
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
      ) : (
        // Video: Thumbnail with Play Button and Duration
        <div className="flex-shrink-0 relative">
          <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {lesson?.thumbnail ? (
              <img 
                src={lesson.thumbnail} 
                alt={lesson?.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Play className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg">
            <div className="w-6 h-6 rounded-full bg-white/80 group-hover:bg-white transition-colors flex items-center justify-center">
              <Play className="h-2 w-2 text-primary fill-primary" />
            </div>
          </div>

          {/* Duration Badge */}
          {getDurationDisplay() && (
            <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-0.5 py-0.5 rounded">
              {getDurationDisplay()}
            </div>
          )}
        </div>
      )}

      {/* Lesson Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className='text-sm font-medium truncate transition-colors text-foreground group-hover:text-primary'>
                {lesson?.title || 'Untitled Lesson'}
              </h4>
              {isCompleted && (
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              )}
            </div>
            {lesson?.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {lesson.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {getLessonTypeLabel()}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
});

LessonItem.displayName = 'LessonItem';

/**
 * Lessons list container - memoized
 */
const StudentLessonsList = memo(({ lessons = [], isLoading = false, onPlayLesson }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading lessons...
      </div>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No lessons available in this module yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Play className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Lessons ({lessons.length})
        </h3>
      </div>
      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <LessonItem
            key={lesson.id}
            lesson={lesson}
            index={index}
            onPlay={onPlayLesson}
            isCompleted={lesson?.lessonProgress?.[0]?.isCompleted || false}
          />
        ))}
      </div>
    </div>
  );
});

StudentLessonsList.displayName = 'StudentLessonsList';

export default StudentLessonsList;

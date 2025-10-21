import React, { memo, useCallback } from 'react';
import { Play, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Individual lesson item component - memoized for performance
 */
const LessonItem = memo(({ lesson, index, onPlay }) => {
  const handleClick = useCallback(() => {
    if (typeof onPlay === 'function') {
      onPlay(lesson);
    }
  }, [lesson, onPlay]);

  const getLessonIcon = () => {
    const type = String(lesson?.type || '').toUpperCase();
    if (type === 'PDF') return <FileText className="h-4 w-4" />;
    return <Play className="h-4 w-4" />;
  };

  const getLessonTypeColor = () => {
    const type = String(lesson?.type || '').toUpperCase();
    if (type === 'PDF') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (type === 'YOUTUBE') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (type === 'DROPBOX') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getDurationDisplay = () => {
    if (!lesson?.duration) return null;
    const minutes = Math.floor(lesson.duration / 60);
    const seconds = lesson.duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-input bg-card hover:bg-accent/50 transition-colors group">
      {/* Lesson Number */}
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">{index + 1}</span>
      </div>

      {/* Lesson Icon and Type Badge */}
      <div className="flex-shrink-0">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getLessonTypeColor()}`}>
          {getLessonIcon()}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {lesson?.title || 'Untitled Lesson'}
            </h4>
            {lesson?.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {lesson.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {String(lesson?.type || 'UNKNOWN').toUpperCase()}
              </Badge>
              {getDurationDisplay() && (
                <span className="text-xs text-muted-foreground">
                  {getDurationDisplay()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Play Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleClick}
        className="flex-shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
        title="Play lesson"
      >
        <Play className="h-4 w-4" />
      </Button>
    </div>
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
          />
        ))}
      </div>
    </div>
  );
});

StudentLessonsList.displayName = 'StudentLessonsList';

export default StudentLessonsList;

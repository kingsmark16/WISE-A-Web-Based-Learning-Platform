import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CourseCard Component - Display individual course with progress
 * Redesigned for modern aesthetics and responsiveness.
 */
export const CourseCard = ({ course }) => {
  const progress = course.progress?.percentage || 0;
  const isCompleted = progress === 100;

  return (
    <Link 
      to={`/student/homepage/${course.id}/selected-course`} 
      className="group block h-full focus:outline-none"
    >
      <div className="flex flex-col h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50">
        
        {/* Image Section */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/30">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Overlay Gradient on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4">
          
          {/* Title */}
          <h3 
            className="mb-1 font-semibold text-lg leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors" 
            title={course.title}
          >
            {course.title}
          </h3>

          {/* College Badge */}
          <div className="mb-3">
            <Badge 
              variant="secondary" 
              className="max-w-full justify-start font-medium text-xs bg-secondary/50 hover:bg-secondary/70 transition-colors"
              title={course.college}
            >
              <span className="truncate">
                {course.college}
              </span>
            </Badge>
          </div>

          {/* Instructor Info */}
          <div className="mb-4 flex items-center gap-3">
             <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                {course.managedBy?.imageUrl ? (
                   <img src={course.managedBy.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                   <div className="flex h-full w-full items-center justify-center bg-secondary">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                   </div>
                )}
             </div>
             <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate text-foreground/90">
                   {course.managedBy?.fullName || 'Unknown Instructor'}
                </span>
                <span className="text-xs text-muted-foreground">Instructor</span>
             </div>
          </div>

          {/* Footer / Progress */}
          <div className="mt-auto space-y-2">
             <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Progress</span>
                <span className={cn(
                  "font-bold", 
                  isCompleted ? "text-green-600 dark:text-green-500" : "text-primary"
                )}>
                   {progress}%
                </span>
             </div>
             <Progress 
                value={progress} 
                className="h-1.5 bg-secondary" 
                indicatorClassName={cn(
                   "transition-all duration-500",
                   isCompleted && "bg-green-600 dark:bg-green-500"
                )}
             />
          </div>
          
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;

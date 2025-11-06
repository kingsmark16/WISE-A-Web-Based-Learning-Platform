import { useArchivedCourses } from '@/hooks/student/useArchivedCourses';
import { CourseCard } from '@/components/student/CourseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArchivedCourseGridSkeleton } from '@/components/skeletons';
import { Archive, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ArchivedCoursesPage = () => {
  const { data: archivedCourses = [], isLoading, error } = useArchivedCourses();

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-0">
        {/* Header skeleton */}
        <div className="flex items-center justify-between px-4 sm:px-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Grid skeleton */}
        <div className="px-4 sm:px-6">
          <ArchivedCourseGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-6">
          <Archive className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Archived Courses</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load archived courses. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2 mb-6">
          <Archive className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Archived Courses</h1>
        </div>
      </div>

      {archivedCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
            <Archive className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No archived courses</p>
          <p className="text-sm text-muted-foreground">
            Courses that have been archived by instructors will appear here
          </p>
        </div>
      ) : (
        /* Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6">
          {archivedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedCoursesPage;

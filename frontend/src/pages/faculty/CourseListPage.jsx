import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useFacultyCourseList } from '@/hooks/faculty/useFacultyCourseList';
import { useDraftCourses } from '@/hooks/faculty/useDraftCourses';
import { Loader, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { ArchivedCourseGridSkeleton } from '@/components/skeletons';

const CourseListPage = ({ status, title, description }) => {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const facultyId = user?.id || (userLoaded && localStorage.getItem('userId'));

  const { data: allCourses = [], isLoading: allLoading, error: allError } = useFacultyCourseList(facultyId);
  const { data: draftCourses = [], isLoading: draftLoading, error: draftError } = useDraftCourses();

  // Debug logging
  console.log('All Courses Data:', allCourses);
  console.log('Draft Courses Data:', draftCourses);
  console.log('Faculty ID:', facultyId);

  // Get courses based on status
  let courses = [];
  let isLoading = false;
  let error = null;

  if (status === 'draft') {
    courses = draftCourses;
    isLoading = draftLoading;
    error = draftError;
  } else if (status === 'active' || status === 'published') {
    // Filter published courses (case-insensitive)
    courses = allCourses.filter(c => c.status?.toUpperCase() === 'PUBLISHED');
    console.log('Filtered Published Courses:', courses);
    isLoading = allLoading;
    error = allError;
  } else if (status === 'archived') {
    // Filter archived courses (case-insensitive)
    courses = allCourses.filter(c => c.status?.toUpperCase() === 'ARCHIVED');
    console.log('Filtered Archived Courses:', courses);
    isLoading = allLoading;
    error = allError;
  }

  if (!userLoaded || !authLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="px-2 md:px-4 py-6">
        <ErrorState
          variant="inline"
          type="auth"
          title="Sign In Required"
          message="Please sign in to access your courses"
          showHome
          homeRoute="/sign-in"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 md:px-4 py-6">
        <ErrorState
          variant="inline"
          title="Error Loading Courses"
          message={error?.message || 'Unknown error'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 px-2 md:px-4 py-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Courses Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              {/* Thumbnail Skeleton */}
              <Skeleton className="w-full h-40 sm:h-48" />
              
              {/* Content Skeleton */}
              <div className="p-3 md:p-4 space-y-3">
                {/* College Badge */}
                <Skeleton className="h-3 w-24" />
                
                {/* Title - 2 lines */}
                <div className="space-y-1">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
                
                {/* Actions Buttons */}
                <div className="flex gap-2 pt-2">
                  <Skeleton className="flex-1 h-10" />
                  <Skeleton className="flex-1 h-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 md:px-4 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No {status} courses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      {course.thumbnail && (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className={!course.thumbnail ? 'w-full h-40 bg-muted flex items-center justify-center' : ''}>
        {!course.thumbnail && (
          <BookOpen className="w-12 h-12 text-slate-400" />
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* College Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground truncate">{course.college}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold truncate">{course.title}</h3>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => navigate(`/faculty/courses/${course.id}/manage`)}
            className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
          >
            Manage Content
          </button>
          <button
            onClick={() => navigate(`/faculty/courses/${course.id}/analytics`)}
            className="flex-1 px-3 py-2 text-sm border rounded hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"
          >
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseListPage;

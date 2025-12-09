import { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useFacultyCourseList } from '@/hooks/faculty/useFacultyCourseList';
import { useDraftCourses } from '@/hooks/faculty/useDraftCourses';
import { Loader, Plus, Trash2, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';

const FacultyCourses = () => {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Determine active tab from URL or query params
  let initialTab = 'all';
  if (location.pathname.includes('/draft-courses')) {
    initialTab = 'draft';
  } else if (searchParams.get('tab')) {
    initialTab = searchParams.get('tab');
  }
  const [activeTab, setActiveTab] = useState(initialTab);

  const facultyId = user?.id || (userLoaded && localStorage.getItem('userId'));

  const { data: allCourses = [], isLoading: allLoading, error: allError } = useFacultyCourseList(facultyId);
  const { data: draftCourses = [], isLoading: draftLoading, error: draftError } = useDraftCourses();

  // Debug logging
  console.log('Faculty ID:', facultyId);
  console.log('All Courses:', allCourses);
  console.log('Draft Courses:', draftCourses);
  console.log('All Error:', allError);
  console.log('Draft Error:', draftError);

  // Filter courses by status
  const publishedCourses = allCourses.filter(c => c.status === 'PUBLISHED');
  const archivedCourses = allCourses.filter(c => c.status === 'ARCHIVED');

  if (!userLoaded || !authLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please sign in to access your courses</p>
        </div>
      </div>
    );
  }

  if (allError || draftError) {
    return (
      <div className="p-6">
        <ErrorState
          variant="inline"
          title="Error Loading Courses"
          message={allError?.message || draftError?.message || 'Unknown error'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (allLoading || draftLoading) {
    return (
      <div className="space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-4 border-b pb-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>

        {/* Courses Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              {/* Thumbnail Skeleton */}
              <Skeleton className="w-full h-40" />
              
              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                {/* Status Badge & College */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                
                {/* Title */}
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                
                {/* Stats */}
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Skeleton className="flex-1 h-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground mt-2">Manage and organize your courses</p>
        </div>
        <Button onClick={() => navigate('/faculty/create-course')} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Course
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Courses ({allCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'draft'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Draft ({draftCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'published'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Published ({publishedCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'archived'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Archived ({archivedCourses.length})
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'all' && allCourses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No courses yet. Create your first course!</p>
          </div>
        )}

        {activeTab === 'draft' && draftCourses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No draft courses</p>
          </div>
        )}

        {activeTab === 'published' && publishedCourses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No published courses</p>
          </div>
        )}

        {activeTab === 'archived' && archivedCourses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No archived courses</p>
          </div>
        )}

        {activeTab === 'all' && allCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}

        {activeTab === 'draft' && draftCourses.map(course => (
          <CourseCard key={course.id} course={course} isDraft />
        ))}

        {activeTab === 'published' && publishedCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}

        {activeTab === 'archived' && archivedCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

const CourseCard = ({ course, isDraft = false }) => {
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
          <p className="text-muted-foreground text-sm">No image</p>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            course.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
            course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {course.status}
          </span>
          <span className="text-xs text-muted-foreground">{course.college}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold line-clamp-2">{course.title}</h3>

        {/* Description (for draft) */}
        {isDraft && course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        )}

        {/* Stats */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Modules: {course.moduleCount || 0}</p>
          <p>Enrollments: {course.enrollmentCount || 0}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => navigate(`/faculty/courses/${course.id}/analytics`)}
            className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
          >
            Analytics
          </button>
          {isDraft && (
            <button className="px-3 py-2 text-sm border rounded hover:bg-muted transition-colors flex items-center justify-center gap-1">
              <Archive className="w-4 h-4" />
            </button>
          )}
          <button className="px-3 py-2 text-sm border rounded hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1 text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyCourses;

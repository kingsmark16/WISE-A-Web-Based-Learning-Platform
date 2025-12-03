import { useEnrolledCourses } from '@/hooks/student/useEnrolledCourses';
import { useEnrollInCourse } from '@/hooks/courses/useCourses';
import { CourseCard } from '@/components/student/CourseCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MyCourseGridSkeleton } from '@/components/skeletons';
import { BookOpen, AlertCircle, Plus, LayoutGrid, ListFilter } from 'lucide-react';
import CourseEnrollDialog from '@/components/CourseEnrollDialog';
import { useState, useMemo, useEffect } from 'react';

/**
 * MyCourses Page - Display all enrolled courses
 * Features:
 * - Filter by status (All, In Progress, Completed)
 * - Sort by progress, title, or last accessed
 * - Responsive grid layout
 */
export const MyCourses = () => {
  // All hooks must be called before any return
  const { data: courses = [], isLoading, error } = useEnrolledCourses();
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const { mutate: enrollCourse, isPending: isEnrolling, isSuccess } = useEnrollInCourse();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  useEffect(() => {
    if (isSuccess && isJoinDialogOpen) {
      setIsJoinDialogOpen(false);
    }
  }, [isSuccess, isJoinDialogOpen]);

  const handleJoinCourse = (courseCode) => {
    enrollCourse({ courseCode });
  };

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses;
    // Apply status filter
    if (statusFilter === 'in-progress') {
      filtered = filtered.filter(course => (course.progress?.percentage || 0) < 100);
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(course => (course.progress?.percentage || 0) >= 100);
    }
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'progress-high':
          return (b.progress?.percentage || 0) - (a.progress?.percentage || 0);
        case 'progress-low':
          return (a.progress?.percentage || 0) - (b.progress?.percentage || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'recent':
        default:
          return new Date(b.enrolledAt) - new Date(a.enrolledAt);
      }
    });
    return sorted;
  }, [courses, statusFilter, sortBy]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="mb-8">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <MyCourseGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background/50">
        <div className="text-center space-y-4 max-w-md">
          <div className="bg-destructive/10 p-3 rounded-full w-fit mx-auto">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Error Loading Courses</h2>
          <p className="text-muted-foreground">
            {error?.response?.data?.message || 'Failed to load your enrolled courses'}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background/50">
        <div className="text-center space-y-6 max-w-md">
          <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto animate-in zoom-in duration-500">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">No Courses Yet</h2>
            <p className="text-muted-foreground">
              You haven't enrolled in any courses yet. Join a course with a code to get started!
            </p>
          </div>
          <Button size="lg" onClick={() => setIsJoinDialogOpen(true)} className="w-full sm:w-auto gap-2">
            <Plus className="h-4 w-4" />
            Join Course
          </Button>
          
          <CourseEnrollDialog 
            open={isJoinDialogOpen} 
            onOpenChange={setIsJoinDialogOpen}
            onConfirm={handleJoinCourse}
            isLoading={isEnrolling}
            courseName="a new course"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Courses</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage and track your learning progress across all your enrolled courses
            </p>
          </div>
          <Button onClick={() => setIsJoinDialogOpen(true)} size="lg" className="w-full md:w-auto gap-2 shadow-sm hover:shadow-md transition-all">
            <Plus className="h-4 w-4" />
            Join Course
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="border rounded-xl p-4 mb-8 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-4 z-10 backdrop-blur-sm bg-card/95 supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground w-full sm:w-auto">
            <LayoutGrid className="h-4 w-4" />
            <span>{filteredAndSortedCourses.length} {filteredAndSortedCourses.length === 1 ? 'Course' : 'Courses'}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ListFilter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="progress-high">Highest Progress</SelectItem>
                <SelectItem value="progress-low">Lowest Progress</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Empty Filter State */}
        {filteredAndSortedCourses.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-xl border border-dashed">
            <div className="bg-muted/50 p-4 rounded-full w-fit mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No courses found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your filters to see more courses
            </p>
            <Button 
              variant="link" 
              onClick={() => {
                setStatusFilter('all');
                setSortBy('recent');
              }}
              className="mt-2"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      <CourseEnrollDialog 
        open={isJoinDialogOpen} 
        onOpenChange={setIsJoinDialogOpen}
        onConfirm={handleJoinCourse}
        isLoading={isEnrolling}
        courseName="a new course"
      />
    </div>
  );
};

export default MyCourses;

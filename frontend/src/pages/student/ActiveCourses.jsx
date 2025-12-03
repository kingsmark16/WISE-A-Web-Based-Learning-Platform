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
import { BookOpen, AlertCircle, Plus, PlayCircle } from 'lucide-react';
import CourseEnrollDialog from '@/components/CourseEnrollDialog';
import { useState, useMemo, useEffect } from 'react';

/**
 * ActiveCourses Page - Display enrolled courses that are not yet completed
 * Features:
 * - Shows courses with progress < 100%
 * - Search courses by title
 * - Filter by category
 * - Sort by progress, title, or last accessed
 * - Responsive grid layout
 */
const ActiveCourses = () => {
  const { data: courses = [], isLoading, error } = useEnrolledCourses();
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  // Filter to only active courses (progress < 100%)
  const activeCourses = useMemo(() => {
    return courses.filter(course => (course.progress?.percentage || 0) < 100);
  }, [courses]);

  // Get unique colleges from active courses
  const categories = useMemo(() => {
    const colleges = new Set(activeCourses.map(course => course.college).filter(Boolean));
    return Array.from(colleges).sort();
  }, [activeCourses]);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = activeCourses;
    // Apply college filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.college === selectedCategory);
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
  }, [activeCourses, selectedCategory, sortBy]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-0">
        {/* Header skeleton */}
        <div className="px-4 sm:px-6">
          <Skeleton className="h-8 w-32 mb-2" />
        </div>
        
        {/* Filters skeleton */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full md:w-40" />
            <Skeleton className="h-10 w-full md:w-40" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="px-4 sm:px-6">
          <MyCourseGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Error Loading Courses</h2>
          <p className="text-muted-foreground">
            {error?.response?.data?.message || 'Failed to load your active courses'}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Empty state - no enrolled courses at all
  if (courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <BookOpen className="w-16 h-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No Courses Yet</h2>
            <p className="text-muted-foreground">
              You haven't enrolled in any courses yet. Join a course with a code to get started!
            </p>
          </div>
          <Button size="lg" onClick={() => setIsJoinDialogOpen(true)}>
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

  // Empty state - no active courses (all completed)
  if (activeCourses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <PlayCircle className="w-16 h-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No Active Courses</h2>
            <p className="text-muted-foreground">
              You've completed all your enrolled courses! Join a new course to continue learning.
            </p>
          </div>
          <Button size="lg" onClick={() => setIsJoinDialogOpen(true)}>
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
    <div className="space-y-4 sm:space-y-6 px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Active Courses</h1>
        </div>
        <Button onClick={() => setIsJoinDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Join Course
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40">
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

      {/* Results count */}
      {filteredAndSortedCourses.length !== activeCourses.length && (
        <p className="text-sm text-muted-foreground px-4 sm:px-6">
          Showing {filteredAndSortedCourses.length} of {activeCourses.length} courses
        </p>
      )}

      {/* Empty filtered results */}
      {filteredAndSortedCourses.length === 0 ? (
        <div className="text-center py-12">
          <PlayCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No courses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filter criteria
          </p>
        </div>
      ) : (
        /* Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6">
          {filteredAndSortedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

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

export default ActiveCourses;

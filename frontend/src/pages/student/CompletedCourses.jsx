import { useEnrolledCourses } from '@/hooks/student/useEnrolledCourses';
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
import { CheckCircle2, AlertCircle, Trophy } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

/**
 * CompletedCourses Page - Display enrolled courses that have been completed
 * Features:
 * - Shows courses with progress = 100%
 * - Search courses by title
 * - Filter by category
 * - Sort by title, or completion date
 * - Responsive grid layout
 */
const CompletedCourses = () => {
  const { data: courses = [], isLoading, error } = useEnrolledCourses();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Filter to only completed courses (progress = 100%)
  const completedCourses = useMemo(() => {
    return courses.filter(course => (course.progress?.percentage || 0) >= 100);
  }, [courses]);

  // Get unique colleges from completed courses
  const categories = useMemo(() => {
    const colleges = new Set(completedCourses.map(course => course.college).filter(Boolean));
    return Array.from(colleges).sort();
  }, [completedCourses]);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = completedCourses;
    // Apply college filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.college === selectedCategory);
    }
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'recent':
        default: {
          // Sort by last accessed (most recent completion first)
          const aDate = a.progress?.lastAccessedAt ? new Date(a.progress.lastAccessedAt) : new Date(a.enrolledAt);
          const bDate = b.progress?.lastAccessedAt ? new Date(b.progress.lastAccessedAt) : new Date(b.enrolledAt);
          return bDate - aDate;
        }
      }
    });
    return sorted;
  }, [completedCourses, selectedCategory, sortBy]);

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
            {error?.response?.data?.message || 'Failed to load your completed courses'}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Empty state - no completed courses
  if (completedCourses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Trophy className="w-16 h-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No Completed Courses Yet</h2>
            <p className="text-muted-foreground">
              Keep learning! Complete your enrolled courses to see them here.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/student/my-courses/active">View Active Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold tracking-tight">Completed Courses</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4" />
          <span>{completedCourses.length} course{completedCourses.length !== 1 ? 's' : ''} completed</span>
        </div>
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
              <SelectItem value="recent">Recently Completed</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      {filteredAndSortedCourses.length !== completedCourses.length && (
        <p className="text-sm text-muted-foreground px-4 sm:px-6">
          Showing {filteredAndSortedCourses.length} of {completedCourses.length} courses
        </p>
      )}

      {/* Empty filtered results */}
      {filteredAndSortedCourses.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
    </div>
  );
};

export default CompletedCourses;

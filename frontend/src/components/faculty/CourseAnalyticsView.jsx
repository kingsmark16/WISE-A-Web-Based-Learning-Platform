import { useState } from 'react';
import { useFacultyCourseList } from '@/hooks/faculty/useFacultyCourseList';
import { useCourseAnalytics } from '@/hooks/faculty/useCourseAnalytics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, BarChart3, FileText, ClipboardList, Users } from 'lucide-react';
import StatCard from './StatCard';

const CourseAnalyticsView = ({ facultyId }) => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Fetch list of courses
  const { data: courses, isLoading: coursesLoading } = useFacultyCourseList(facultyId);
  
  // Fetch analytics for selected course
  const { data: courseAnalytics, isLoading: analyticsLoading, error } = useCourseAnalytics(
    facultyId,
    selectedCourseId
  );

  // Auto-select first course on load
  if (courses && courses.length > 0 && !selectedCourseId) {
    setSelectedCourseId(courses[0].id);
  }

  const isLoading = coursesLoading || analyticsLoading;

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Select a Course</label>
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a course to view analytics" />
          </SelectTrigger>
          <SelectContent>
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="">
                No courses available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading course analytics: {error.message}</p>
        </div>
      )}

      {/* Analytics Display */}
      {courseAnalytics && !isLoading && (
        <div className="space-y-6">
          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{courseAnalytics.course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Status:</strong> <span className="capitalize">{courseAnalytics.course.status}</span>
                </p>
                {courseAnalytics.course.description && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Description:</strong> {courseAnalytics.course.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Course Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Modules"
              value={courseAnalytics.analytics.modules}
              icon={BarChart3}
              color="bg-blue-600"
            />
            <StatCard
              title="Lessons"
              value={courseAnalytics.analytics.lessons}
              icon={FileText}
              color="bg-purple-600"
            />
            <StatCard
              title="Quizzes"
              value={courseAnalytics.analytics.quizzes}
              icon={ClipboardList}
              color="bg-orange-600"
            />
            <StatCard
              title="Enrollments"
              value={courseAnalytics.analytics.enrollments}
              icon={Users}
              color="bg-red-600"
            />
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Content Richness</p>
                <p className="text-2xl font-bold">
                  {(courseAnalytics.analytics.modules + courseAnalytics.analytics.lessons + courseAnalytics.analytics.quizzes)}
                </p>
                <p className="text-xs text-muted-foreground">Total items</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg per Module</p>
                <p className="text-2xl font-bold">
                  {courseAnalytics.analytics.modules > 0
                    ? ((courseAnalytics.analytics.lessons + courseAnalytics.analytics.quizzes) / courseAnalytics.analytics.modules).toFixed(1)
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">
                  {courseAnalytics.analytics.enrollments}
                </p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Course Health</p>
                <p className="text-2xl font-bold">
                  {courseAnalytics.analytics.modules > 0 && courseAnalytics.analytics.enrollments > 0
                    ? '✅'
                    : courseAnalytics.analytics.modules > 0
                    ? '⚠️'
                    : '❌'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !courseAnalytics && courses && courses.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Select a course to view detailed analytics</p>
        </div>
      )}

      {/* No Courses State */}
      {!isLoading && courses && courses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No courses found. Create a course first to view analytics.</p>
        </div>
      )}
    </div>
  );
};

export default CourseAnalyticsView;

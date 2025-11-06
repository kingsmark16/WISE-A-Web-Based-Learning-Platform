import { useParams, useNavigate } from 'react-router-dom';
import { useGetCourse } from '../../hooks/courses/useCourses';
import { useCourseAnalytics } from '@/hooks/faculty/useCourseAnalytics';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Users, MessageSquare, Eye, MessageCircle, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminCourseAnalytics = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // Get course data to extract facultyId
  const { data: courseData, isLoading: courseLoading } = useGetCourse(courseId);
  const facultyId = courseData?.course?.facultyId;

  // Fetch analytics using the facultyId from course data
  const { data: analyticsData, isLoading: analyticsLoading, error } = useCourseAnalytics(facultyId, courseId);

  const isLoading = courseLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 px-3 sm:px-6 md:px-8 lg:px-12 py-6">
        {/* Header Skeleton - stacked on mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto space-y-3">
            <Skeleton className="h-8 w-3/4 sm:w-64" />
            <Skeleton className="h-6 w-5/6 sm:w-96" />
            <Skeleton className="h-4 w-3/4 sm:w-64" />
          </div>
          <div className="w-full sm:w-auto flex gap-3">
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        {/* Key Metrics Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 border rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Community Metrics Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 border rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>

        {/* Tables Skeleton */}
        <div className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">Error loading analytics: {error.message}</p>
        </div>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const course = analyticsData?.course;

  return (
    <div className="space-y-6 px-3 sm:px-6 md:px-8 lg:px-12 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="gap-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{course?.title || 'Course Analytics'}</h1>
          <p className="text-muted-foreground mt-2">Course Analytics & Engagement</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
          <p className="text-2xl font-bold">{analyticsData?.totalEnrollments || 0}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            <p className="text-sm text-muted-foreground">Total Lessons</p>
          </div>
          <p className="text-2xl font-bold">{analyticsData?.engagement?.totalLessons || 0}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            <p className="text-sm text-muted-foreground">Total Quizzes</p>
          </div>
          <p className="text-2xl font-bold">{analyticsData?.engagement?.totalQuizzes || 0}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-purple-500" />
            <p className="text-sm text-muted-foreground">Overall Lesson Views</p>
          </div>
          <p className="text-2xl font-bold">{analyticsData?.engagement?.totalLessonViews || 0}</p>
        </div>
      </div>

      {/* Community & Completion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5 text-indigo-500" />
            <p className="text-sm text-muted-foreground">Forum Posts</p>
          </div>
          <p className="text-2xl font-bold">{analyticsData?.community?.forumPosts || 0}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5 text-cyan-500" />
            <p className="text-sm text-muted-foreground">Forum Replies</p>
          </div>
          <p className="text-2xl font-bold">{analyticsData?.community?.forumReplies || 0}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-amber-500" />
            <p className="text-sm text-muted-foreground">Certificates Issued</p>
          </div>
          <p className="text-2xl font-bold">{analyticsData?.certificates || 0}</p>
        </div>
      </div>

      {/* Course Completion Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-semibold">Course Completion</h2>
          <p className="text-sm text-muted-foreground">Student progress visualization</p>
        </div>

        {/* Course Completion Line Graph */}
        {analyticsData?.courseCompletion && analyticsData.courseCompletion.length > 0 ? (
          <div className="border rounded-lg p-6 bg-background">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={analyticsData.courseCompletion}
                margin={{ top: 5, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="studentName"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Progress']}
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Progress %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="border rounded-lg p-6 text-center text-muted-foreground">
            No completion data available
          </div>
        )}
      </div>

      {/* Lessons Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-semibold">Lessons</h2>
          <p className="text-sm text-muted-foreground">Individual lesson engagement and views</p>
        </div>

        {/* Lessons Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Lesson Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Module</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Total Views</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Students Viewed</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analyticsData?.lessons && analyticsData.lessons.length > 0 ? (
                  analyticsData.lessons.map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">{lesson.title}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{lesson.moduleName}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        <span className="text-blue-600">{lesson.totalViews}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {lesson.uniqueStudents} / {course?.enrollments?.length || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-sm text-muted-foreground text-center">
                      No lesson data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Students Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-semibold">Most Engaged Students</h2>
          <p className="text-sm text-muted-foreground">Ranked by engagement score (lesson views, coverage, and quiz attempts)</p>
        </div>

        {/* Top Students Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Lesson Views</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Lessons Viewed</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Quizzes Attempted</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Engagement Score</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analyticsData?.topStudents && analyticsData.topStudents.length > 0 ? (
                  analyticsData.topStudents.map((student, index) => (
                    <tr key={student.studentId} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium max-w-[220px] truncate min-w-0">
                        {student.studentName}
                      </td>
                      <td className="px-4 py-3 text-sm">{student.lessonViews}</td>
                      <td className="px-4 py-3 text-sm">{student.lessonsViewed}</td>
                      <td className="px-4 py-3 text-sm">{student.quizzesAttempted}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        <span className="text-purple-600">{Math.round(student.engagementScore)}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-3 text-sm text-muted-foreground text-center">
                      No student data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseAnalytics;

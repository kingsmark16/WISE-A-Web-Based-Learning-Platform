import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTopCoursesByEngagement } from '@/hooks/faculty/useTopCoursesByEngagement';
import { Button } from '@/components/ui/button';
import { Loader, TrendingUp, BookOpen, MessageSquare, BarChart3 } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer
} from 'recharts';

const TopCoursesByEngagement = ({ facultyId }) => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('1m');
  const [sortBy, setSortBy] = useState('engagement'); // 'engagement', 'name', 'popularity'
  
  const { data: topCoursesData, isLoading, error } = useTopCoursesByEngagement(facultyId, timeRange);

  // Sort courses based on selected option
  const getSortedCourses = () => {
    if (!topCoursesData?.topCourses) return [];
    
    const courses = [...topCoursesData.topCourses];
    
    switch(sortBy) {
      case 'name':
        return courses.sort((a, b) => a.title.localeCompare(b.title));
      case 'popularity':
        return courses.sort((a, b) => b.enrollments.total - a.enrollments.total);
      case 'engagement':
      default:
        return courses.sort((a, b) => b.engagement.score - a.engagement.score);
    }
  };

  const chartData = topCoursesData?.chartCourses?.map((course, index) => ({
    id: course.id,
    name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
    fullName: course.title,
    enrollments: course.enrollments.recent,
    totalEnrollments: course.enrollments.total,
    engagement: course.engagement.score,
    uniqueQuizAttempts: course.engagement.uniqueQuizAttempts,
    uniqueLessonAccess: course.engagement.uniqueLessonAccess,
    totalQuizzes: course.engagement.totalQuizzes,
    totalLessons: course.engagement.totalLessons,
    fill: ['#3b82f6', '#8b5cf6', '#f97316', '#ef4444', '#10b981'][index % 5]
  })) || [];

  const chartConfig = {
    engagement: {
      label: 'Content Coverage %',
      color: '#3b82f6'
    }
  };

  return (
    <div className="p-6 border rounded-lg space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Top Courses by Engagement</h3>
          <p className="text-xs text-muted-foreground mt-1">Ranked by content coverage percentage</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === '1d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('1d')}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant={timeRange === '1w' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('1w')}
            className="text-xs"
          >
            Last Week
          </Button>
          <Button
            variant={timeRange === '1m' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('1m')}
            className="text-xs"
          >
            Last Month
          </Button>
          <Button
            variant={timeRange === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('all')}
            className="text-xs"
          >
            All Time
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-800 text-sm">Unable to load engagement data. Please try again.</p>
        </div>
      )}

      {!isLoading && chartData.length === 0 && (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>No student engagement data available for this period</p>
        </div>
      )}

      {!isLoading && chartData.length > 0 && (
        <>
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '11px' }}
                height={40}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                allowDecimals={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg space-y-2">
                        <p className="text-sm font-semibold text-foreground">{data.fullName}</p>
                        
                        <div className="border-t border-border pt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-blue-500" />
                            <span className="text-xs text-muted-foreground">
                              Enrollments: <span className="font-bold text-foreground">{data.enrollments}</span> (Total: {data.totalEnrollments})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">
                              Lessons Accessed: <span className="font-bold text-foreground">{data.uniqueLessonAccess}</span>
                              {data.totalLessons > 0 && <span className="text-muted-foreground"> / {data.totalLessons * data.totalEnrollments} possible</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-muted-foreground">
                              Quizzes Attempted: <span className="font-bold text-foreground">{data.uniqueQuizAttempts}</span>
                              {data.totalQuizzes > 0 && <span className="text-muted-foreground"> / {data.totalQuizzes * data.totalEnrollments} possible</span>}
                            </span>
                          </div>
                          <div className="border-t border-border pt-1 mt-1">
                            <span className="text-xs font-semibold text-foreground">
                              Content Coverage: {data.engagement}%
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              (60% lessons + 40% quizzes)
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="engagement"
                radius={[8, 8, 0, 0]}
                fill="currentColor"
              >
                <LabelList
                  dataKey="engagement"
                  position="top"
                  formatter={(value) => `${value}%`}
                  fill="hsl(var(--foreground))"
                  fontSize={12}
                  fontWeight="bold"
                />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          {/* Engagement Formula Explanation */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
            <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">How Engagement is Calculated</p>
            <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <p><strong>Coverage Percentage</strong> = (60% × Lessons Accessed) + (40% × Quizzes Attempted)</p>
              <p className="text-blue-700 dark:text-blue-300">Measured against enrolled students accessing all available content</p>
            </div>
          </div>

          {/* Course Details Table */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">Engagement Details</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Summary of lesson access and quiz attempts for all courses
                </p>
              </div>
              
              {/* Sort Options */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium">Sort by:</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSortBy('engagement')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      sortBy === 'engagement'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    Engagement
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      sortBy === 'name'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    A-Z
                  </button>
                  <button
                    onClick={() => setSortBy('popularity')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      sortBy === 'popularity'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    Popularity
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {getSortedCourses().map((course, index) => (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                    <div className="flex items-center justify-center w-8 h-8 rounded font-bold text-primary bg-primary/10" style={{ backgroundColor: chartData.find(c => c.id === course.id)?.fill + '20' || '#3b82f620' }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.enrollments.total} enrolled
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate(`/faculty/courses/${course.id}/analytics`)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Analytics
                    </Button>
                  </div>
                  
                  {/* Engagement Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 ml-2 text-xs">
                    <div className="bg-green-50 dark:bg-green-950 rounded-md p-3 border border-green-200 dark:border-green-800">
                      <p className="text-green-700 dark:text-green-300 font-semibold flex items-center gap-1 mb-2">
                        <BookOpen className="w-4 h-4" />
                        Lessons
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {course.engagement.uniqueLessonAccess}
                        </p>
                        <p className="text-xs text-green-600/70 dark:text-green-400/70">
                          unique views
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-3 border border-blue-200 dark:border-blue-800">
                      <p className="text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        Quizzes
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {course.engagement.uniqueQuizAttempts}
                        </p>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                          unique attempts
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-950 rounded-md p-3 border border-purple-200 dark:border-purple-800">
                      <p className="text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        Engagement
                      </p>
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        {course.engagement.score}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TopCoursesByEngagement;

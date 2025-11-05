import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend
} from 'recharts';

const CourseMetricsRadar = ({ courseStats }) => {
  // Calculate metrics normalized to 0-100 for radar chart
  const maxCourses = Math.max(courseStats?.total || 1, 50);
  const maxModules = Math.max(courseStats?.modules || 1, 100);
  const maxLessons = Math.max(courseStats?.lessons || 1, 200);
  const maxQuizzes = Math.max(courseStats?.quizzes || 1, 50);
  const maxEnrollments = Math.max(courseStats?.enrolled || 1, 500);
  const publishPercentage = courseStats?.total ? ((courseStats?.published || 0) / courseStats?.total) * 100 : 0;

  const chartData = [
    {
      metric: 'Courses',
      value: Math.min((courseStats?.total || 0) / maxCourses * 100, 100),
      fullMark: 100
    },
    {
      metric: 'Published %',
      value: publishPercentage,
      fullMark: 100
    },
    {
      metric: 'Modules',
      value: Math.min((courseStats?.modules || 0) / maxModules * 100, 100),
      fullMark: 100
    },
    {
      metric: 'Lessons',
      value: Math.min((courseStats?.lessons || 0) / maxLessons * 100, 100),
      fullMark: 100
    },
    {
      metric: 'Quizzes',
      value: Math.min((courseStats?.quizzes || 0) / maxQuizzes * 100, 100),
      fullMark: 100
    },
    {
      metric: 'Enrollments',
      value: Math.min((courseStats?.enrolled || 0) / maxEnrollments * 100, 100),
      fullMark: 100
    }
  ];

  const chartConfig = {
    value: {
      label: 'Metric Score',
      color: '#8b5cf6'
    }
  };

  const totalStats = (courseStats?.total || 0) + (courseStats?.modules || 0) + (courseStats?.lessons || 0) + (courseStats?.quizzes || 0) + (courseStats?.enrolled || 0);

  if (totalStats === 0) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm font-semibold mb-4">Course Metrics Overview</h3>
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-semibold mb-4">Course Metrics Overview (Normalized)</h3>
      <ChartContainer config={chartConfig} className="h-96 w-full">
        <RadarChart data={chartData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="metric"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Radar
            name="Metric Score"
            dataKey="value"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
            isAnimationActive={true}
          />
          <Tooltip
            content={<ChartTooltipContent hideLabel />}
          />
        </RadarChart>
      </ChartContainer>
      <p className="text-xs text-muted-foreground mt-2">
        Metrics normalized to 100% scale for comparison
      </p>
    </div>
  );
};

export default CourseMetricsRadar;

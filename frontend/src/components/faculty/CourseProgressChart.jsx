import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CourseProgressChart = ({ courseStats }) => {
  // Simulate course progress data
  const chartData = [
    { week: 'Week 1', modules: Math.floor((courseStats?.modules || 0) * 0.15), lessons: Math.floor((courseStats?.lessons || 0) * 0.12) },
    { week: 'Week 2', modules: Math.floor((courseStats?.modules || 0) * 0.3), lessons: Math.floor((courseStats?.lessons || 0) * 0.25) },
    { week: 'Week 3', modules: Math.floor((courseStats?.modules || 0) * 0.5), lessons: Math.floor((courseStats?.lessons || 0) * 0.45) },
    { week: 'Week 4', modules: Math.floor((courseStats?.modules || 0) * 0.7), lessons: Math.floor((courseStats?.lessons || 0) * 0.65) },
    { week: 'Week 5', modules: Math.floor((courseStats?.modules || 0) * 0.85), lessons: Math.floor((courseStats?.lessons || 0) * 0.8) },
    { week: 'Week 6', modules: courseStats?.modules || 0, lessons: courseStats?.lessons || 0 }
  ];

  const chartConfig = {
    modules: {
      label: 'Modules',
      color: '#3b82f6'
    },
    lessons: {
      label: 'Lessons',
      color: '#8b5cf6'
    }
  };

  if (!courseStats?.modules && !courseStats?.lessons) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm font-semibold mb-4">Course Progress</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No course data
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-semibold mb-4">Course Progress (6-Week View)</h3>
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorModules" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="week"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            content={<ChartTooltipContent hideLabel />}
          />
          <Legend
            content={<ChartLegendContent />}
          />
          <Area
            type="monotone"
            dataKey="modules"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorModules)"
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="lessons"
            stroke="#8b5cf6"
            fillOpacity={1}
            fill="url(#colorLessons)"
            isAnimationActive={true}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default CourseProgressChart;

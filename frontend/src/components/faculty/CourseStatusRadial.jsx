import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CourseStatusRadial = ({ courseStats }) => {
  const chartData = [
    {
      name: 'Archived',
      value: courseStats?.archived || 0,
      fill: '#6b7280'
    },
    {
      name: 'Draft',
      value: courseStats?.draft || 0,
      fill: '#f59e0b'
    },
    {
      name: 'Published',
      value: courseStats?.published || 0,
      fill: '#10b981'
    }
  ].filter(item => item.value > 0);

  const chartConfig = {
    published: {
      label: 'Published',
      color: '#10b981'
    },
    draft: {
      label: 'Draft',
      color: '#f59e0b'
    },
    archived: {
      label: 'Archived',
      color: '#6b7280'
    }
  };

  const totalCourses = (courseStats?.total || 0);

  if (chartData.length === 0) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm font-semibold mb-4">Course Status Distribution (Radial)</h3>
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          No courses available
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-semibold mb-4">Course Status Distribution</h3>
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <RadialBarChart
          data={chartData}
          innerRadius="20%"
          outerRadius="90%"
        >
          <PolarAngleAxis
            type="number"
            domain={[0, totalCourses || 1]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            angleAxisId={0}
            dataKey="value"
            radius={[10, 8]}
            isAnimationActive={true}
            label={{ fill: '#fff', fontSize: 12 }}
          />
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="middle"
            align="right"
          />
          <Tooltip
            content={<ChartTooltipContent hideLabel />}
          />
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
};

export default CourseStatusRadial;

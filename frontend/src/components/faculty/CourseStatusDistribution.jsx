import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CourseStatusDistribution = ({ courseStats }) => {
  // Prepare data for pie chart
  const chartData = [
    {
      name: 'Published',
      value: courseStats?.published || 0,
      fill: '#10b981'
    },
    {
      name: 'Draft',
      value: courseStats?.draft || 0,
      fill: '#f59e0b'
    },
    {
      name: 'Archived',
      value: courseStats?.archived || 0,
      fill: '#6b7280'
    }
  ];

  // Filter out zero values for cleaner chart
  const filteredData = chartData.filter(item => item.value > 0);

  // Chart configuration for shadcn
  const chartConfig = {
    published: {
      label: 'Published',
      color: '#10b981',
      icon: () => null
    },
    draft: {
      label: 'Draft',
      color: '#f59e0b',
      icon: () => null
    },
    archived: {
      label: 'Archived',
      color: '#6b7280',
      icon: () => null
    }
  };

  // Handle empty state
  if (filteredData.length === 0) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm font-semibold mb-4">Course Status Distribution</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No courses yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-semibold mb-4">Course Status Distribution</h3>
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={true}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              padding: '0.75rem'
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const total = filteredData.reduce((sum, item) => sum + item.value, 0);
                const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
                return (
                  <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-semibold text-foreground">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Count: <span className="font-bold text-foreground">{data.value}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Percentage: <span className="font-bold text-foreground">{percentage}%</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
        </PieChart>
      </ChartContainer>
    </div>
  );
};

export default CourseStatusDistribution;

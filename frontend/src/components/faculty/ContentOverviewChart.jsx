import {
  ChartContainer
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ContentOverviewChart = ({ courseStats }) => {
  // Prepare data for pie chart
  const allChartData = [
    {
      name: 'Modules',
      value: Math.round(courseStats?.modules || 0),
      fill: '#0173b2'
    },
    {
      name: 'Lessons',
      value: Math.round(courseStats?.lessons || 0),
      fill: '#de8f05'
    },
    {
      name: 'Quizzes',
      value: Math.round(courseStats?.quizzes || 0),
      fill: '#cc78bc'
    },
    {
      name: 'Enrollments',
      value: Math.round(courseStats?.enrolled || 0),
      fill: '#ca9161'
    }
  ];

  // Filter out items with zero values
  const chartData = allChartData.filter(item => item.value > 0);

  // Chart configuration for shadcn
  const chartConfig = {
    modules: {
      label: 'Modules',
      color: '#0173b2'
    },
    lessons: {
      label: 'Lessons',
      color: '#de8f05'
    },
    quizzes: {
      label: 'Quizzes',
      color: '#cc78bc'
    },
    enrolled: {
      label: 'Enrollments',
      color: '#ca9161'
    }
  };

  // Handle empty state
  const totalContent = chartData.reduce((sum, item) => sum + item.value, 0);
  if (totalContent === 0) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm font-semibold mb-4">Content Overview</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No content yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-semibold mb-4">Content Overview</h3>
      <ChartContainer config={chartConfig} className="h-64 sm:h-80 w-full">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={window.innerWidth < 640 ? 60 : 100}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={true}
          >
            {chartData.map((entry, index) => (
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
                const total = chartData.reduce((sum, item) => sum + item.value, 0);
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

export default ContentOverviewChart;

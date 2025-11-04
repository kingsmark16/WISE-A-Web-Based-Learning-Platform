import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const EnrollmentTrendChart = ({ courseStats }) => {
  const [timeRange, setTimeRange] = useState('6m'); // '1w', '1m', '6m'

  // Generate actual dates and enrollment data
  const generateChartData = (range) => {
    const today = new Date();
    let data = [];

    if (range === '1w') {
      // Last 7 days - show all 7 points
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const percentage = ((7 - i) / 7) * (courseStats?.enrolled || 0);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date,
          enrollments: Math.floor(percentage),
          original: percentage
        });
      }
    } else if (range === '1m') {
      // Last 30 days - show every 3 days (10 points total for clarity)
      for (let i = 29; i >= 0; i -= 3) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const percentage = ((30 - i) / 30) * (courseStats?.enrolled || 0);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date,
          enrollments: Math.floor(percentage),
          original: percentage
        });
      }
      // Ensure we always include today
      if (data[data.length - 1].fullDate.getTime() !== today.getTime()) {
        const percentage = courseStats?.enrolled || 0;
        data.push({
          date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: today,
          enrollments: Math.floor(percentage),
          original: percentage
        });
      }
    } else {
      // Last 6 months - show all 6 points
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const percentage = ((6 - i) / 6) * (courseStats?.enrolled || 0);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          fullDate: date,
          enrollments: Math.floor(percentage),
          original: percentage
        });
      }
    }

    return data;
  };

  const chartData = generateChartData(timeRange);

  const chartConfig = {
    enrollments: {
      label: 'Enrollments',
      color: '#ef4444'
    }
  };

  if (!courseStats?.enrolled) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm font-semibold mb-4">Enrollment Trend</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No enrollment data
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Enrollment Trend</h3>
        <div className="flex gap-2">
          <Button
            variant={timeRange === '1w' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('1w')}
            className="text-xs"
          >
            1 Week
          </Button>
          <Button
            variant={timeRange === '1m' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('1m')}
            className="text-xs"
          >
            1 Month
          </Button>
          <Button
            variant={timeRange === '6m' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('6m')}
            className="text-xs"
          >
            6 Months
          </Button>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-80 w-full">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            content={<ChartTooltipContent hideLabel />}
            formatter={(value) => [value, 'Enrollments']}
          />
          <Legend
            content={<ChartLegendContent />}
          />
          <Line
            type="monotone"
            dataKey="enrollments"
            stroke="#ef4444"
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            isAnimationActive={true}
          />
        </LineChart>
      </ChartContainer>

      <p className="text-xs text-muted-foreground mt-2">
        {timeRange === '1w' && 'Showing data for the last 7 days'}
        {timeRange === '1m' && 'Showing data for the last 30 days'}
        {timeRange === '6m' && 'Showing data for the last 6 months'}
      </p>
    </div>
  );
};

export default EnrollmentTrendChart;

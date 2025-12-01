import { TrendingUp } from 'lucide-react'
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export function TotalCoursesChart({ totalCourses, coursesPerCollege }) {
  // Define colors for colleges (add more as needed)
  const collegeColors = [
    "#4F46E5", // Indigo
    "#22D3EE", // Cyan
    "#F59E42", // Orange
    "#10B981", // Green
    "#F43F5E", // Pink
    "#6366F1", // Blue
    "#FBBF24", // Yellow
    "#A78BFA", // Purple
  ];

  // Map coursesPerCollege to chartData with colors
  const chartData = (coursesPerCollege ?? []).map((col, idx) => ({
    college: `${col.college} -`,
    count: col.count,
    fill: collegeColors[idx % collegeColors.length],
  }));

  // Chart config for legend/tooltip (optional)
  const chartConfig = {};
  chartData.forEach((col) => {
    chartConfig[col.college] = {
      label: col.college,
      color: col.fill,
    };
  });

  // Total courses (fallback to sum if not provided)
  const total =
    totalCourses ??
    chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="flex flex-col w-full h-full">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold">Courses</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 pb-2 sm:pb-4">
        <div className="flex justify-center items-center h-48 sm:h-56">
          <ChartContainer
            config={chartConfig}
            className="w-full h-full flex items-center justify-center"
          >
            <PieChart width={220} height={220}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="college"
                innerRadius={40}
                outerRadius={80}
                strokeWidth={2}
                isAnimationActive={true}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl sm:text-3xl font-bold"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs sm:text-sm"
                          >
                            Courses
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col gap-2 text-xs sm:text-sm pt-2 sm:pt-4 border-t">
        <div className="flex items-center gap-2 leading-none font-medium text-muted-foreground">
          <span>Total Courses Distribution</span>
          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
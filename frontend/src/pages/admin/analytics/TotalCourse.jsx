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
    <Card className="flex flex-col w-full">
      <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
        <CardTitle className="text-sm sm:text-base font-semibold">Courses</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 pb-2 px-3 sm:px-4">
        <div className="flex justify-center items-center h-32 sm:h-36">
          <ChartContainer
            config={chartConfig}
            className="w-full h-full flex items-center justify-center"
          >
            <PieChart width={180} height={180}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="college"
                innerRadius={32}
                outerRadius={65}
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
                            className="fill-foreground text-xl sm:text-2xl font-bold"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 18}
                            className="fill-muted-foreground text-xs"
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
      
      <CardFooter className="flex-col gap-1 text-xs pt-2 pb-3 px-3 sm:px-4 border-t">
        <div className="flex items-center gap-2 leading-none font-medium text-muted-foreground">
          <span>Total Courses Distribution</span>
          <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </div>
      </CardFooter>
    </Card>
  );
}
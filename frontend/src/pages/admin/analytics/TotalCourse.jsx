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
    college: col.college,
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
    <Card className="flex flex-col">
      
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          style={{ minWidth: 200, minHeight: 200, width: "100%", height: "100%" }}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="college"
              innerRadius={60}
              strokeWidth={5}
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-foreground"
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
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Showing total Courses <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
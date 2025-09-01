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

export function TotalCoursesChart({ totalCourses, coursesPerCategory }) {
  // Define colors for categories (add more as needed)
  const categoryColors = [
    "#4F46E5", // Indigo
    "#22D3EE", // Cyan
    "#F59E42", // Orange
    "#10B981", // Green
    "#F43F5E", // Pink
    "#6366F1", // Blue
    "#FBBF24", // Yellow
    "#A78BFA", // Purple
  ];

  // Map coursesPerCategory to chartData with colors
  const chartData = (coursesPerCategory ?? []).map((cat, idx) => ({
    category: cat.category,
    count: cat.count,
    fill: categoryColors[idx % categoryColors.length],
  }));

  // Chart config for legend/tooltip (optional)
  const chartConfig = {};
  chartData.forEach((cat) => {
    chartConfig[cat.category] = {
      label: cat.category,
      color: cat.fill,
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
              nameKey="category"
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
                          Total Courses
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
        
      </CardFooter>
    </Card>
  );
}
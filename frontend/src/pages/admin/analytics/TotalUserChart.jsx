import { TrendingUp } from 'lucide-react'
import { Label, Pie, PieChart, Cell } from "recharts"

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

export function TotalUserChart({ totalUsers, totalAdmins, totalFaculty, totalStudents }) {
  // Define colors for user roles
  const roleColors = [
    "#4F46E5", // Admins - Indigo
    "#10B981", // Faculty - Green
    "#F59E42", // Students - Orange
  ];

  // Prepare chart data for user roles
  const chartData = [
    { role: "Admins", count: totalAdmins, fill: roleColors[0] },
    { role: "Faculty", count: totalFaculty, fill: roleColors[1] },
    { role: "Students", count: totalStudents, fill: roleColors[2] },
  ];

  // Chart config for legend/tooltip (optional)
  const chartConfig = {};
  chartData.forEach((item) => {
    chartConfig[item.role] = {
      label: item.role,
      color: item.fill,
    };
  });

  // Total users (fallback to sum if not provided)
  const total =
    totalUsers ??
    chartData.reduce((acc, curr) => acc + (curr.count || 0), 0);

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
              nameKey="role"
              innerRadius={60}
              strokeWidth={5}
              isAnimationActive={true}
            >
              {chartData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.fill} />
              ))}
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
                          Users
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
          Showing total User <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
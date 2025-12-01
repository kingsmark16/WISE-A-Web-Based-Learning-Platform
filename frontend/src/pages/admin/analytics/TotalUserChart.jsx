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
    <Card className="flex flex-col w-full h-full">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold">Users</CardTitle>
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
                nameKey="role"
                innerRadius={40}
                outerRadius={80}
                strokeWidth={2}
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
                            className="fill-foreground text-2xl sm:text-3xl font-bold"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs sm:text-sm"
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
        </div>
      </CardContent>
      
      <CardFooter className="flex-col gap-2 text-xs sm:text-sm pt-2 sm:pt-4 border-t">
        <div className="flex items-center gap-2 leading-none font-medium text-muted-foreground">
          <span>Total User</span>
          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
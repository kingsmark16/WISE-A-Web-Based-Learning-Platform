import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CustomTooltip = ({ active, payload, label, data }) => {
  if (active && payload && payload.length) {
    const dataPoint = data.find(item => item.name === label || item.fullName === label);
    return (
      <div
        className="bg-black/60 text-white px-3 py-2 rounded-lg border border-gray-600"
      >
        <p className="font-semibold text-sm">{dataPoint?.fullName || label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-xs">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function TopCoursesChart({ data, isLoading, error }) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 sm:h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold">Top 5 Courses by Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-sm">
              Failed to load top courses data
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold">Top 5 Courses by Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80 flex items-center justify-center text-muted-foreground text-sm">
            No course data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart
  const chartData = data.map(course => ({
    name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
    enrollments: course.enrollments,
    completions: course.completions,
    fullName: course.title,
  }));

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold">Top Courses by Enrollments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Chart Container */}
        <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
          <div className="px-4 sm:px-0 min-w-full sm:min-w-0">
            <ResponsiveContainer width="100%" height={250} minWidth={280}>
              <BarChart 
                data={chartData} 
                margin={{ top: 16, right: 12, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} width={40} />
                <Tooltip 
                  content={<CustomTooltip data={chartData} />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                
                <Bar dataKey="enrollments" fill="#3b82f6" name="Enrollments" activeOpacity={0.5} radius={[4, 4, 0, 0]} />
                <Bar dataKey="completions" fill="#10b981" name="Completions" activeOpacity={0.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Detailed List */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-semibold text-xs sm:text-sm text-foreground">Course Details</h3>
          <div className="space-y-1 sm:space-y-2">
            {data.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-xs sm:text-sm">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-xs sm:text-sm">{course.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{course.faculty}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 sm:gap-2 text-xs font-medium flex-shrink-0">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs whitespace-nowrap">
                    {course.enrollments}
                  </span>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs whitespace-nowrap">
                    {course.completions}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

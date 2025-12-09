import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award } from "lucide-react";

const CustomTooltip = ({ active, payload, label, data }) => {
  if (active && payload && payload.length) {
    const dataPoint = data.find(item => item.name === label || item.fullName === label);
    return (
      <div className="bg-black/60 text-white px-3 py-2 rounded-lg border border-gray-600">
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

export function TopStudentsChart({ data, isLoading, error }) {
  const colors = ['#fbbf24', '#a78bfa', '#60a5fa', '#34d399', '#f87171'];

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
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Top 5 Students by Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            variant="compact"
            message="Failed to load top students data"
            onRetry={() => window.location.reload()}
          />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Top 5 Students by Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80 flex items-center justify-center text-muted-foreground text-sm">
            No student data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart - take top 5
  const topStudents = data.slice(0, 5);
  const chartData = topStudents.map((student, index) => ({
    name: student.name.split(' ')[0],
    achievements: student.certificatesEarned || 0,
    enrollments: student.totalCoursesEnrolled || 0,
    fullName: student.name,
    imageUrl: student.imageUrl,
    index,
  }));

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          Top Students by Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Chart Container */}
        <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
          <div className="px-4 sm:px-0 min-w-full sm:min-w-0">
            <ResponsiveContainer width="100%" height={250} minWidth={280}>
              <BarChart 
                data={chartData} 
                margin={{ top: 16, right: 12, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 12 }} width={40} allowDecimals={false} />
                <Tooltip 
                  content={<CustomTooltip data={chartData} />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Bar dataKey="achievements" fill="#fbbf24" name="Certificates" radius={[4, 4, 0, 0]} activeOpacity={0.5} />
                <Bar dataKey="enrollments" fill="#60a5fa" name="Courses" radius={[4, 4, 0, 0]} activeOpacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Ranking */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-semibold text-xs sm:text-sm text-foreground">Student Rankings</h3>
          <div className="space-y-1 sm:space-y-2">
            {topStudents.map((student, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Rank Badge */}
                <div 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                >
                  {index + 1}
                </div>

                {/* Avatar */}
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                  <AvatarImage src={student.imageUrl} alt={student.name} />
                  <AvatarFallback className="text-xs">
                    {student.name?.split(" ").map(n => n[0]).join("") || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.certificatesEarned || 0} cert{(student.certificatesEarned || 0) !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Achievement Badge */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="text-xs sm:text-sm font-semibold text-amber-600">
                    {student.certificatesEarned || 0}
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

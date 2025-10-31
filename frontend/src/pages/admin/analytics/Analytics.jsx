import { TotalCoursesChart } from "./TotalCourse"
import { TotalUserChart } from "./TotalUserChart"
import { ActiveUserAnalytics } from "./ActiveUserAnalytics"
import { useGetCourseTotal } from "../../../hooks/analytics/adminAnalytics/useGetCourseTotal"
import { useGetActiveUsers } from "../../../hooks/analytics/adminAnalytics/useGetActiveUsers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function Analytics() {
  const {
    data: courseAnalytics,
    isLoading: loadingCourseAnalytics,
    error: errorCourseAnalytics,
  } = useGetCourseTotal()
  const {
    data: activeUsersData,
    isLoading: loadingActiveUser,
    error: errorActiveUser,
  } = useGetActiveUsers()

  if (loadingCourseAnalytics) {
    return (
      <div className="space-y-6 md:p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Users Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (errorCourseAnalytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert
          variant="destructive"
          className="max-w-md w-full mx-auto flex flex-col items-center gap-3 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="h-8 w-8 text-destructive animate-bounce" />
            <span className="text-xl font-bold text-destructive">Error</span>
          </div>
          <AlertTitle className="text-lg font-semibold text-destructive text-center">
            Failed to load analytics
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground text-center">
            {errorCourseAnalytics.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of users and courses activity
          </p>
        </div>
      </div>

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TotalCoursesChart
          totalCourses={courseAnalytics?.totalCourses}
          coursesPerCollege={courseAnalytics?.coursesPerCollege}
        />
        <TotalUserChart
          totalUsers={courseAnalytics?.totalUsers}
          totalAdmins={courseAnalytics?.totalAdmins}
          totalFaculty={courseAnalytics?.totalFaculty}
          totalStudents={courseAnalytics?.totalStudents}
        />
      </div>

      {/* Active Users Section */}
      <div>
        <ActiveUserAnalytics
          activeUsersData={activeUsersData}
          isLoading={loadingActiveUser}
          error={errorActiveUser}
        />
      </div>
    </div>
  )
}
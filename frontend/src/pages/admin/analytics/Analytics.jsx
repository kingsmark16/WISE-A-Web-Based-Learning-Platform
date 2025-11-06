import { TotalCoursesChart } from "./TotalCourse"
import { TotalUserChart } from "./TotalUserChart"
import { ActiveUserAnalytics } from "./ActiveUserAnalytics"
import { TopCoursesChart } from "./TopCoursesChart"
import { TopStudentsChart } from "./TopStudentsChart"
import { useGetCourseTotal } from "../../../hooks/analytics/adminAnalytics/useGetCourseTotal"
import { useGetActiveUsers } from "../../../hooks/analytics/adminAnalytics/useGetActiveUsers"
import { useGetTopCourses } from "../../../hooks/analytics/adminAnalytics/useGetTopCourses"
import { useGetTopStudentsByAchievements } from "../../../hooks/analytics/adminAnalytics/useGetTopStudents"
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
  const {
    data: topCoursesData,
    isLoading: loadingTopCourses,
    error: errorTopCourses,
  } = useGetTopCourses()
  const {
    data: topStudentsData,
    isLoading: loadingTopStudents,
    error: errorTopStudents,
  } = useGetTopStudentsByAchievements()

  if (loadingCourseAnalytics) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 sm:h-10 w-40 sm:w-48" />
              <Skeleton className="h-4 w-full sm:w-96" />
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="w-full">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 sm:h-80 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Active Users Skeleton */}
            <Card className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 sm:h-80 w-full" />
              </CardContent>
            </Card>

            {/* Top Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="w-full">
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 sm:h-80 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (errorCourseAnalytics) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <Alert
          variant="destructive"
          className="max-w-md w-full mx-auto flex flex-col items-center gap-3 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="h-8 w-8 text-destructive animate-bounce" />
            <span className="text-lg sm:text-xl font-bold text-destructive">Error</span>
          </div>
          <AlertTitle className="text-base sm:text-lg font-semibold text-destructive text-center">
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
    <div className="w-full min-h-screen bg-background">
      {/* Main container with responsive padding */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header Section */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Overview of users and courses activity
            </p>
          </div>

          {/* Main Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
          <div className="w-full">
            <ActiveUserAnalytics
              activeUsersData={activeUsersData}
              isLoading={loadingActiveUser}
              error={errorActiveUser}
            />
          </div>

          {/* Top Courses and Top Students - Stacked on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <TopCoursesChart
              data={topCoursesData}
              isLoading={loadingTopCourses}
              error={errorTopCourses}
            />
            <TopStudentsChart
              data={topStudentsData}
              isLoading={loadingTopStudents}
              error={errorTopStudents}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
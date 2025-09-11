import { TotalCoursesChart } from "./TotalCourse"
import { TotalUserChart } from "./TotalUserChart"
import { ActiveUserAnalytics } from "./ActiveUserAnalytics"
import { useGetCourseTotal } from "../../../hooks/analytics/adminAnalytics/useGetCourseTotal"
import { useGetActiveUsers } from "../../../hooks/analytics/adminAnalytics/useGetActiveUsers"

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

  if (loadingCourseAnalytics)
    return (
      <div className="flex items-center justify-center h-[300px]">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        <span className="ml-4 text-lg font-medium text-muted-foreground">Loading analytics...</span>
      </div>
    )
  if (errorCourseAnalytics)
    return (
      <div className="flex items-center justify-center h-[300px] text-destructive">
        Error loading analytics: {errorCourseAnalytics.message}
      </div>
    )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-base">
          Overview of users and courses activity
        </p>
      </div>

      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <TotalCoursesChart
          totalCourses={courseAnalytics?.totalCourses}
          coursesPerCategory={courseAnalytics?.coursesPerCategory}
        />
        <TotalUserChart
          totalUsers={courseAnalytics.totalUsers}
          totalAdmins={courseAnalytics.totalAdmins}
          totalFaculty={courseAnalytics.totalFaculty}
          totalStudents={courseAnalytics.totalStudents}
        />
      </div>

      {/* Active Users Section */}
      <div className="mt-6">
        <ActiveUserAnalytics
          activeUsersData={activeUsersData}
          isLoading={loadingActiveUser}
          error={errorActiveUser}
        />
      </div>
    </div>
  )
}
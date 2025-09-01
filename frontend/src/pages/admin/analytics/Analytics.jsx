import { useGetCourseTotal } from "../../../hooks/analytics/useGetCourseTotal"
import { TotalCoursesChart } from "./TotalCourse"
import { TotalUserChart } from "./TotalUserChart";
import { ActiveUserAnalytics } from "./ActiveUserAnalytics";

const Analytics = () => {
  const {data: courseAnalytics, isLoading: loadingCourseAnalytics, error: errorCourseAnalytics} = useGetCourseTotal();

  if(loadingCourseAnalytics) return <div>Loading...</div>
  if(errorCourseAnalytics) return <div>Error loading analytics: {errorCourseAnalytics.message}</div>

  return (
    <div className="mt-8">
      <div>
        <ActiveUserAnalytics/>
      </div>
      <div className="flex justify-center gap-5 items-center">
        <TotalCoursesChart totalCourses={courseAnalytics?.totalCourses} coursesPerCategory={courseAnalytics?.coursesPerCategory} />
        <TotalUserChart totalUsers={courseAnalytics.totalUsers} totalAdmins={courseAnalytics.totalAdmins} totalFaculty={courseAnalytics.totalFaculty} totalStudents={courseAnalytics.totalStudents}/>
      </div>
    </div>
  )
}

export default Analytics
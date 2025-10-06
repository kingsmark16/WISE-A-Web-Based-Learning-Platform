import { useGetCourseTotal } from '../../hooks/analytics/adminAnalytics/useGetCourseTotal';

const FacultyHomePage = () => {

    const {data, isLoading, error} = useGetCourseTotal();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading course total: {error.message}</div>;
    }

    const total = data?.totalCourses || 0;

  return (
    <div>
        <h1>Faculty Home Page</h1>
        <p>Total Courses: {total}</p>
    </div>
  )
}

export default FacultyHomePage
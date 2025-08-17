import { useParams } from "react-router-dom"
import { useGetCourse } from "../hooks/useCourses";


const CourseDetail = () => {

    const {id} = useParams();
    const {data, isLoading, error } = useGetCourse(id);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    const course = data?.course;

    if(!course) return <div>Course not found</div>

  return (
    <div>
        <h2>{course.title}</h2>
        <p>{course.description}</p>
    </div>
  )
}

export default CourseDetail
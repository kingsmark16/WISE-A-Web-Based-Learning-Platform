import CourseListPage from './CourseListPage';

const ArchivedCourses = () => {
  return (
    <CourseListPage 
      status="archived"
      title="Archived Courses"
      description="Your archived courses"
    />
  );
};

export default ArchivedCourses;

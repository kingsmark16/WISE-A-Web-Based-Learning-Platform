import CourseListPage from './CourseListPage';

const DraftCourses = () => {
  return (
    <CourseListPage 
      status="draft"
      title="Draft Courses"
      description="Courses in draft state that you haven't published yet"
    />
  );
};

export default DraftCourses;

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { useDeleteCourse, useGetCourses } from "../../../hooks/useCourses";
import { useUser } from "@clerk/clerk-react";

const Courses = () => {

  const {user} = useUser();
  
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  const {data: courseQuery = [], isLoading: getCoursesLoading, error: getCoursesError} = useGetCourses();
  const {mutate: deleteCourse} = useDeleteCourse();
  const navigate = useNavigate();

  const allCourses = useMemo(
    () => courseQuery?.courses || [],
    [courseQuery]
  );

  const categories = useMemo(() => {
    const cats = allCourses.map(c => c.category).filter(Boolean);
    return ["All", ...Array.from(new Set(cats))];
  }, [allCourses]);

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allCourses.filter(course => {
      const matchCategory =
        selectedCategory === "All" || course.category === selectedCategory;
      const matchTitle =
        term === "" ||
        (course.title || "").toLowerCase().includes(term);
      return matchCategory && matchTitle;
    });
  }, [allCourses, selectedCategory, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / limit));

  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredCourses.slice(start, start + limit);
  }, [filteredCourses, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchTerm]);


  if (getCoursesLoading) return <div>Loading...</div>;
  if (getCoursesError) return <div>{getCoursesError.message}</div>


  const getCreatorDisplayName = (course) => {
    if(user && course.createdBy?.clerkId === user.id) return "You";
    return course.createdBy?.fullName;
  }

  

  const handleView = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  }

  const handleEdit = (courseId) => {
    navigate(`/admin/courses/edit/${courseId}`);
  };

  const handleDelete = (courseId) => {
    if(window.confirm("Are you sure you want to delete this course?")){
      deleteCourse(courseId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <select
          className="px-4 py-2 rounded border"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
            type="text"
            placeholder="Search by title..."
            className="px-4 py-2 rounded border flex-1 min-w-[240px]"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />

        <button onClick={() => navigate('/admin/courses/create')}>Create Course</button>
      </div>

      <div>
        <Table>
          <TableCaption>A list of all courses.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Course Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCourses.map(course => (
                <TableRow 
                  key={course.id}
                  >
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.isPublished ? "Yes" : "No"}</TableCell>
                  <TableCell>{getCreatorDisplayName(course)}</TableCell>
                  <TableCell>{course.managedBy?.fullName}</TableCell>
                  <TableCell>{new Date(course.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <button onClick={() => handleEdit(course.id)}>Edit</button>
                    <button onClick={() => handleDelete(course.id)}>Delete</button>
                    <button onClick={() => handleView(course.id)}>View</button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2 mt-4 items-center">
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Courses;
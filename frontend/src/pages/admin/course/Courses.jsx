import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { useDeleteCourse, useGetCourses } from "../../../hooks/useCourses";
import { useUser } from "@clerk/clerk-react";
import { Eye, Edit, Trash2, Plus, Search } from "lucide-react";

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


  if (getCoursesLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (getCoursesError) return <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg">{getCoursesError.message}</div>


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
    <div className="space-y-6 px-2 min-h-screen">
      {/* Header */}
      <div className="bg-foreground/5 rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-6">Course Management</h1>
        
        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col w-full sm:flex-row justify-baseline items-baseline gap-3 flex-1">
            <select
              className="text-foreground bg-accent px-4 py-2 rounded-lg border focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by course title..."
                className="pl-10 pr-4 py-2 w-full rounded-lg bg-accent focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={() => navigate('/admin/courses/create')}
            className="flex justify-center items-center gap-2 bg-primary hover:bg-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-foreground/5 rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableCaption className="py-4">
              Showing {paginatedCourses.length} of {filteredCourses.length} courses
            </TableCaption>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="font-semibold py-4 px-6 text-left whitespace-nowrap">Course Title</TableHead>
                <TableHead className="font-semibold py-4 px-6 text-left whitespace-nowrap">Category</TableHead>
                <TableHead className="font-semibold py-4 px-6 text-left whitespace-nowrap">Code</TableHead>
                <TableHead className="font-semibold py-4 px-6 text-center whitespace-nowrap">Status</TableHead>
                <TableHead className="font-semibold py-4 px-6 text-left whitespace-nowrap">Created By</TableHead>
                <TableHead className="font-semibold py-4 px-6 text-left whitespace-nowrap">Instructor</TableHead>
                <TableHead className="font-semibold py-4 px-6 text-left whitespace-nowrap">Last Updated</TableHead>
                <TableHead className="font-semibold py-4 px-6 text-center whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      
                      <p className="text-lg font-medium">No courses found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCourses.map((course, index) => (
                  <TableRow 
                    key={course.id}
                    className={`border-b hover: transition-colors ${index % 2 === 0 ? '' : ''}`}
                  >
                    <TableCell className="py-4 px-6 font-medium whitespace-nowrap">
                      {course.title}
                    </TableCell>
                    <TableCell className="py-4 px-6 whitespace-nowrap">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {course.category}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 font-mono text-sm whitespace-nowrap">
                      {course.code}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 whitespace-nowrap">
                      {getCreatorDisplayName(course)}
                    </TableCell>
                    <TableCell className="py-4 px-6 whitespace-nowrap">
                      {course.managedBy?.fullName || "Not assigned"}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm whitespace-nowrap">
                      {new Date(course.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleView(course.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Course"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(course.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-foreground/5 rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-sm">
            Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(page * limit, filteredCourses.length)}
            </span>{' '}
            of <span className="font-medium">{filteredCourses.length}</span> results
          </p>
          
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600'
                        : 'text-foreground'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
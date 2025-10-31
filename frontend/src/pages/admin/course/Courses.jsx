import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useGetCourses } from "../../../hooks/courses/useCourses";
import { useUser } from "@clerk/clerk-react";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  BookOpen,
  Calendar,
  ArrowUpDown,
  Archive as ArchiveIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Courses = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, title-asc, title-desc
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef(null);

  const limit = 12;

  const { 
    data: courseData, 
    isLoading: getCoursesLoading, 
    error: getCoursesError 
  } = useGetCourses({
    page: currentPage,
    limit,
    search: "",
    status: statusFilter,
    category: categoryFilter
  });

  // Get all unique categories for filter dropdown
  const { data: allCoursesData } = useGetCourses({ limit: 1000 });
  const categories = useMemo(() => {
    const allCourses = allCoursesData?.courses || [];
    const cats = allCourses.map(c => c.category).filter(Boolean);
    return [...Array.from(new Set(cats))];
  }, [allCoursesData]);

  // Filter suggestions based on search input
  const suggestions = useMemo(() => {
    if (!searchInput.trim()) return [];
    
    const allCourses = allCoursesData?.courses || [];
    return allCourses.filter(course => 
      course.title.toLowerCase().includes(searchInput.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
  }, [searchInput, allCoursesData]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCreatorDisplayName = (course) => {
    if (user && course.createdBy?.clerkId === user.id) return "You";
    return course.createdBy?.fullName || "Unknown";
  };

  const handleView = (courseId) => {
    navigate(`/admin/courses/view/${courseId}`);
  };

  const handleCreateCourse = () => {
    navigate('/admin/courses/create');
  };

  const handleSuggestionClick = (course) => {
    setSelectedCourse(course);
    setSearchInput(course.title);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSelectedCourse(null);
    setStatusFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const hasActiveFilters = searchInput || statusFilter !== "all" || categoryFilter !== "all";

  // Display filtered and sorted courses
  const displayedCourses = useMemo(() => {
    let courses = courseData?.courses || [];
    if (selectedCourse) {
      return [selectedCourse];
    }
    
    // Apply sorting
    const sortedCourses = [...courses].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    return sortedCourses;
  }, [selectedCourse, courseData?.courses, sortBy]);

  const pagination = courseData?.pagination || {};

  if (getCoursesLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Filters Skeleton */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Skeleton className="h-10 w-full md:flex-1" />
            <Skeleton className="h-10 w-full md:w-[180px]" />
            <Skeleton className="h-10 w-full md:w-[180px]" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="space-y-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (getCoursesError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4 sm:p-6">
        <Alert
          variant="destructive"
          className="max-w-md w-full mx-auto flex flex-col items-center gap-3"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="h-8 w-8 text-destructive animate-bounce" />
            <span className="text-xl font-bold text-destructive">Error</span>
          </div>
          <AlertTitle className="text-lg font-semibold text-destructive text-center">
            Failed to load courses
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground text-center">
            An unexpected error occurred. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Course Management
          </h1>
          <p className="text-muted-foreground">
            Manage and organize your courses efficiently
          </p>
        </div>
        <Button 
          onClick={handleCreateCourse} 
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full min-w-3xs flex-1" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Search courses by title..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSelectedCourse(null);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 border-2 focus:border-primary transition-colors"
            />
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 z-50 max-h-60 sm:max-h-80 overflow-y-auto shadow-lg">
                <CardContent className="p-2">
                  {suggestions.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleSuggestionClick(course)}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{course.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {course.category && (
                            <Badge variant="secondary" className="text-xs">
                              {course.category}
                            </Badge>
                          )}
                          <Badge
                            className={`text-xs ${
                              course.status === 'PUBLISHED'
                                ? "bg-green-500 text-white"
                                : course.status === 'DRAFT'
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-500 text-white"
                            }`}
                          >
                            {course.status === 'PUBLISHED' ? "Published" : course.status === 'DRAFT' ? "Draft" : "Archived"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-full md:w-[180px] border-2">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(value) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-full md:w-[180px] border-2">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => {
            setSortBy(value);
          }}>
            <SelectTrigger className="w-full md:w-[180px] border-2">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Courses Table */}
      <div className="rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/10">
              <TableHead className="font-semibold min-w-[200px]">Course Title</TableHead>
              <TableHead className="font-semibold min-w-[120px]">Category</TableHead>
              <TableHead className="font-semibold min-w-[100px]">Status</TableHead>
              <TableHead className="font-semibold min-w-[150px]">Created By</TableHead>
              <TableHead className="font-semibold min-w-[150px]">Instructor</TableHead>
              <TableHead className="font-semibold min-w-[120px]">Last Updated</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedCourses.length > 0 ? (
              displayedCourses.map((course) => (
                <TableRow key={course.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{course.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {course.category ? (
                      <Badge variant="secondary" className="text-xs font-medium">
                        {course.category}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No category</span>
                    )}
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <Badge
                      className={`text-xs font-medium ${
                        course.status === 'PUBLISHED'
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : course.status === 'DRAFT'
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "bg-gray-500 hover:bg-gray-600 text-white"
                      }`}
                    >
                      {course.status === 'PUBLISHED' ? "Published" : course.status === 'DRAFT' ? "Draft" : "Archived"}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {course.createdBy.imageUrl ? (
                        <img
                          src={course.createdBy.imageUrl}
                          alt={getCreatorDisplayName(course)}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {getCreatorDisplayName(course).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium truncate">{getCreatorDisplayName(course)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px] sm:min-w-[150px]">
                    {course.managedBy ? (
                      <div className="flex items-center gap-2 overflow-hidden">
                        {course.managedBy.imageUrl ? (
                          <img
                            src={course.managedBy.imageUrl}
                            alt={course.managedBy.fullName}
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {course.managedBy.fullName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium truncate">{course.managedBy.fullName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(course.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right min-w-[100px]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleView(course.id)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4 text-blue-500" />
                          <span className="font-medium">View</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 opacity-50 mb-2" />
                    <p className="font-medium">No courses found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!selectedCourse && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
            Showing {displayedCourses.length} of {pagination.totalCourses || 0} courses
          </div>
          <div className="flex items-center space-x-2 sm:space-x-6 lg:space-x-8">
            <div className="flex items-center justify-center text-sm font-medium px-4 py-2 bg-primary/10 rounded-lg">
              Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!pagination.hasPreviousPage}
                className="h-9 w-9 p-0 border-2"
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
                className="h-9 w-9 p-0 border-2"
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Courses;
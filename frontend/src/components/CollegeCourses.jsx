import { useNavigate, useParams } from "react-router-dom";
import { useStudentSearch } from "../hooks/student/useStudentSearch";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, ArrowLeft } from "lucide-react";

const CollegeCourses = () => {
  const navigate = useNavigate();
  const { collegeName } = useParams();
  const decodedCollege = collegeName ? decodeURIComponent(collegeName) : "";

  const { data, isLoading, error } = useStudentSearch("", decodedCollege, {
    enabled: decodedCollege.length > 0
  });

  if (!decodedCollege) {
    return (
      <div className="space-y-4 sm:space-y-6 px-4">
        <ErrorState
          variant="inline"
          type="notFound"
          title="College Not Specified"
          message="College not specified. Please go back and select a college."
          showBack
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-0">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="h-full overflow-hidden">
                <Skeleton className="h-40 sm:h-48 md:h-56 rounded-t-lg w-full" />
                <CardContent className="p-3 sm:p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 px-4">
        <ErrorState
          variant="inline"
          title="Failed to Load Courses"
          message={`Failed to load courses for ${decodedCollege}. Please try again.`}
          onRetry={() => window.location.reload()}
          showBack
        />
      </div>
    );
  }

  const { courses = [], totalResults = 0 } = data || {};

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/student")}
              className="h-auto w-auto p-1 hover:bg-muted rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
              {decodedCollege}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground ml-10">
            {totalResults} {totalResults === 1 ? "course" : "courses"} available
          </p>
        </div>
      </div>

      {/* Empty State */}
      {totalResults === 0 && (
        <div className="p-4 sm:p-6">
          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              No courses found in {decodedCollege}. Check back later for new courses!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Courses Grid */}
      {courses.length > 0 && (
        <section className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/student/homepage/${course.id}/selected-course`)}
                className="h-full focus:outline-none rounded-lg user-select-none cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/student/homepage/${course.id}/selected-course`);
                  }
                }}
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col border p-0 rounded-lg">
                  {/* Thumbnail */}
                  <div className="h-40 sm:h-52 md:h-56 overflow-hidden bg-muted flex items-center justify-center relative flex-shrink-0">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-2 sm:p-3 md:p-4 flex flex-col justify-between flex-1 space-y-1 sm:space-y-2 overflow-hidden">
                    <div className="min-h-fit">
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 sm:mt-1">
                        {course.college}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {course.managedBy?.fullName || "No instructor"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CollegeCourses;

import { useSearchParams, useNavigate } from "react-router-dom";
import { useStudentSearch } from "../../hooks/student/useStudentSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  Search, 
  ArrowRight,
  AlertCircle
} from "lucide-react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const college = searchParams.get("college") || "";

  const { data, isLoading, error } = useStudentSearch(query, college, {
    enabled: query.length > 0 || college.length > 0
  });

  if (!query && !college) {
    return (
      <div className="space-y-4 sm:space-y-6 px-0">
        <Alert>
          <Search className="h-4 w-4" />
          <AlertDescription>
            Please enter a search query to see results.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((j) => (
            <Card key={j} className="h-[300px] flex flex-col p-0 w-full">
              <Skeleton className="rounded-t-xl w-full h-[180px]" />
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 px-0">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load search results. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { courses = [], totalResults = 0 } = data || {};

  return (
    <div className="space-y-4 sm:space-y-6 px-0">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {college ? `${college} Courses` : 'Search Results'}
          </h1>
        </div>
      </div>

      {totalResults === 0 && (
        <div className="p-4 sm:p-6">
          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              {college 
                ? `No courses found in ${college}.`
                : 'No courses found for your search query. Try different keywords.'
              }
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Courses Section */}
      {courses.length > 0 && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/student/homepage/${course.id}/selected-course`)}
                role="button"
                tabIndex={0}
                className="h-full cursor-pointer"
                style={{ outline: "none" }}
              >
                <Card className="hover:shadow-xl transition-shadow duration-200 group h-[300px] flex flex-col p-0 w-full">
                  <div className="rounded-t-xl overflow-hidden flex items-center justify-center bg-muted h-[180px]">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-slate-400" />
                    )}
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-primary mb-2 truncate">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground text-xs mb-3 truncate">
                        {course.college}
                      </p>
                      <p className="text-muted-foreground text-xs truncate">
                        {course.managedBy?.fullName || "No instructor"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;

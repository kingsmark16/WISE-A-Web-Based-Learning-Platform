import { useSearchParams, useNavigate } from "react-router-dom";
import { useStudentSearch } from "../../hooks/student/useStudentSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  Search, 
  ArrowRight
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
            <Skeleton className="h-6 sm:h-8 w-32 sm:w-40 mb-2" />
            <Skeleton className="h-4 w-48 sm:w-64" />
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="space-y-2 md:space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-2 md:p-4 border rounded-lg">
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  <Skeleton className="h-8 w-8 md:h-12 md:w-12 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                    <Skeleton className="h-3 sm:h-5 w-3/4" />
                    <Skeleton className="h-2.5 sm:h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-6 w-6 sm:h-10 sm:w-10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 px-0">
        <ErrorState
          variant="inline"
          title="Search Failed"
          message="Failed to load search results. Please try again."
          onRetry={() => window.location.reload()}
        />
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
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Courses ({courses.length})</h2>
          </div>
          <div className="space-y-2 md:space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-2 md:p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/student/homepage/${course.id}/selected-course`)}
              >
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  <div className="h-8 w-8 md:h-12 md:w-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <BookOpen className="h-4 w-4 md:h-6 md:w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs md:text-base truncate">{course.title}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                      {course.college && (
                        <Badge variant="outline" className="text-[9px] md:text-xs px-1 py-0 h-3.5 md:h-4">{course.college}</Badge>
                      )}
                      {course.managedBy && (
                        <span className="truncate">by {course.managedBy.fullName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 flex-shrink-0">
                  <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;

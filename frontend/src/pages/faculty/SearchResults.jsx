import { useSearchParams, useNavigate } from "react-router-dom";
import { useFacultySearch } from "../../hooks/faculty/useFacultySearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  Search, 
  ArrowRight
} from "lucide-react";

const FacultySearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const { data, isLoading, error } = useFacultySearch(query, {
    enabled: query.length > 0
  });

  if (!query) {
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
          <div className="space-y-2 sm:space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center justify-between p-2 sm:p-4 border rounded-lg">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg flex-shrink-0" />
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Search Results</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Found {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
          </p>
        </div>
      </div>

      {/* No Results */}
      {totalResults === 0 && (
        <Alert>
          <Search className="h-4 w-4" />
          <AlertDescription>
            No courses found matching your search query.
          </AlertDescription>
        </Alert>
      )}

      {/* Courses Section */}
      {courses.length > 0 && (
        <div className="p-4 sm:p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              My Courses
              <Badge variant="secondary" className="ml-2 text-[10px] sm:text-xs">
                {courses.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-2 sm:space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/faculty/courses/view/${course.id}`)}
                  className="flex items-center justify-between p-2 sm:p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-8 w-8 sm:h-12 sm:w-12 object-cover rounded-lg border flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-muted-foreground mt-0.5">
                        {course.status && (
                          <Badge 
                            variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'} 
                            className="text-[9px] md:text-xs px-1 py-0 h-3.5 md:h-4"
                          >
                            {course.status}
                          </Badge>
                        )}
                        {course.college && (
                          <Badge variant="outline" className="text-[9px] md:text-xs px-1 py-0 h-3.5 md:h-4">
                            {course.college}
                          </Badge>
                        )}
                        {course.enrollmentCount !== undefined && (
                          <span className="text-[10px] md:text-xs">
                            {course.enrollmentCount} enrolled
                          </span>
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
          </CardContent>
        </div>
      )}
    </div>
  );
};

export default FacultySearchResults;

import { useSearchParams, useNavigate } from "react-router-dom";
import { useAdminSearch } from "../../hooks/useAdminSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Search, 
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const { data, isLoading, error } = useAdminSearch(query, {
    enabled: query.length > 0
  });

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 sm:p-6">
            <div className="space-y-2 sm:space-y-4">
              {[1, 2].map((j) => (
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
        ))}
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

  const { courses = [], faculty = [], students = [], totalResults = 0 } = data || {};

  return (
    <div className="space-y-4 sm:space-y-6 px-0">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Search Results</h1>
          <p className="text-muted-foreground">
            Found {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
          </p>
        </div>
      </div>

      {totalResults === 0 && (
        <div className="p-4 sm:p-6">
          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              No results found for your search query. Try different keywords.
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
                onClick={() => navigate(`/admin/courses/view/${course.id}`)}
              >
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  <div className="h-8 w-8 md:h-12 md:w-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 md:h-6 md:w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                      <h3 className="font-semibold text-xs md:text-base truncate">{course.title}</h3>
                      <Badge variant={course.isPublished ? "default" : "secondary"} className="text-[9px] md:text-xs px-1 py-0 h-4 md:h-5 flex-shrink-0">
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-muted-foreground">
                      {course.category && (
                        <Badge variant="outline" className="text-[9px] md:text-xs px-1 py-0 h-3.5 md:h-4">{course.category}</Badge>
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

      {/* Faculty Section */}
      {faculty.length > 0 && (
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Faculty ({faculty.length})</h2>
          </div>
          <div className="space-y-2 md:space-y-3">
            {faculty.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 md:p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/faculty-management/view/${member.id}`)}
              >
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="text-[10px] md:text-sm">
                      {getInitials(member.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs md:text-base truncate">{member.fullName}</h3>
                    <p className="text-[10px] md:text-sm text-muted-foreground truncate">
                      {member.emailAddress}
                    </p>
                    <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
                      <span className="text-[9px] md:text-xs text-muted-foreground">
                        {member.totalCourses} course{member.totalCourses !== 1 ? "s" : ""}
                      </span>
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

      {/* Students Section */}
      {students.length > 0 && (
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Students ({students.length})</h2>
          </div>
          <div className="space-y-2 md:space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-2 md:p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/student-management/view/${student.id}`)}
              >
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                    <AvatarImage src={student.imageUrl} />
                    <AvatarFallback className="text-[10px] md:text-sm">
                      {getInitials(student.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs md:text-base truncate">{student.fullName}</h3>
                    <p className="text-[10px] md:text-sm text-muted-foreground truncate">
                      {student.emailAddress}
                    </p>
                    <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
                      <span className="text-[9px] md:text-xs text-muted-foreground">
                        {student.totalEnrollments} enrollment{student.totalEnrollments !== 1 ? "s" : ""}
                      </span>
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

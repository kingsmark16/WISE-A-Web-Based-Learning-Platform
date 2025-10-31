import { useParams, useNavigate } from "react-router-dom";
import { useGetSingleFaculty } from "../../../hooks/analytics/adminAnalytics/useGetFaculty";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, BookOpen, FileEdit, Calendar } from "lucide-react";

const FacultyInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetSingleFaculty(id);
  const faculty = data?.faculty;

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-0 sm:px-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-0 sm:px-6 max-w-7xl mx-auto">
        <div className="text-destructive text-lg font-semibold mb-2">Error loading faculty</div>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-0 sm:px-6 max-w-7xl mx-auto">
        <div className="text-muted-foreground text-lg font-semibold mb-2">Faculty Not Found</div>
        <p className="text-sm text-muted-foreground mb-4">The faculty member you're looking for doesn't exist.</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-0 sm:px-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Button 
        onClick={() => navigate(-1)} 
        variant="ghost" 
        className="mb-2 hover:bg-accent"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header Card */}
      <Card className="overflow-hidden border-0">
        <CardContent className="p-0">
          <div className="px-6 sm:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                <AvatarImage src={faculty.imageUrl} alt={faculty.fullName} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-primary/60 text-white">
                  {getInitials(faculty.fullName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-row items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap">
                    {faculty.fullName}
                  </h1>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{faculty.emailAddress}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Joined {formatDate(faculty.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Managed Courses */}
        <Card className="border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="px-4 sm:px-6 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold">Managed Courses</h2>
              </div>
            </div>
            
            <div className="px-2 sm:px-4">
              {faculty.managedCourses?.length > 0 ? (
                <div className="space-y-1">
                  {faculty.managedCourses.map((course) => (
                    <Card 
                      key={course.id} 
                      className="group hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border-0"
                      onClick={() => navigate(`/admin/courses/view/${course.id}`)}
                    >
                      <CardContent className="px-2 sm:px-3">
                        <div className="flex items-center gap-3">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {course.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {course.college && (
                                <Badge variant="secondary" className="text-xs">
                                  {course.college}
                                </Badge>
                              )}
                              <Badge
                                className={`text-xs ${
                                  course.status === 'PUBLISHED'
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                                }`}
                              >
                                {course.status === 'PUBLISHED' ? "Published" : "Draft"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-3 rounded-full bg-muted/50 mb-3">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No managed courses yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Created Courses */}
        <Card className="border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="px-4 sm:px-6 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <FileEdit className="h-5 w-5 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold">Created Courses</h2>
              </div>
            </div>
            
            <div className="px-2 sm:px-4">
              {faculty.createdCourses?.length > 0 ? (
                <div className="space-y-1">
                  {faculty.createdCourses.map((course) => (
                    <Card 
                      key={course.id} 
                      className="group hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border-0"
                    >
                      <CardContent className="px-2 sm:px-3">
                        <div className="flex items-center gap-3">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <FileEdit className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {course.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {course.college && (
                                <Badge variant="secondary" className="text-xs">
                                  {course.college}
                                </Badge>
                              )}
                              <Badge
                                className={`text-xs ${
                                  course.status === 'PUBLISHED'
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                                }`}
                              >
                                {course.status === 'PUBLISHED' ? "Published" : "Draft"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-3 rounded-full bg-muted/50 mb-3">
                    <FileEdit className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No created courses yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyInfo;
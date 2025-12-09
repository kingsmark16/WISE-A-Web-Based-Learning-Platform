import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSingleFaculty } from "../../../hooks/analytics/adminAnalytics/useGetFaculty";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Mail, BookOpen, Calendar, Users } from "lucide-react";

// Mobile-optimized skeleton loader for courses list
const CourseSkeletonLoader = () => (
  <div className="space-y-2 py-3 px-3 sm:px-4">
    {[1, 2].map((i) => (
      <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-md">
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
          <Skeleton className="h-3 sm:h-4 w-full max-w-xs" />
          <div className="flex gap-1 sm:gap-2">
            <Skeleton className="h-4 w-16 sm:w-20" />
            <Skeleton className="h-4 w-16 sm:w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Mobile-optimized header skeleton loader
const HeaderSkeletonLoader = () => (
  <Card className="overflow-hidden border-0">
    <CardContent className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex gap-3 sm:gap-4">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2 sm:space-y-2.5">
            <Skeleton className="h-6 sm:h-7 w-full max-w-xs" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const FacultyInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetSingleFaculty(id);
  const faculty = useMemo(() => data?.faculty, [data]);

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="w-full space-y-3 sm:space-y-4 px-3 sm:px-4 py-3 sm:py-4">
        <Skeleton className="h-9 w-20" />
        <HeaderSkeletonLoader />
        <div className="space-y-3 sm:space-y-4">
          <Card className="border-0 overflow-hidden">
            <CardHeader className="px-3 sm:px-4 py-3 border-b bg-muted/40">
              <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardHeader>
            <CourseSkeletonLoader />
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full space-y-3 sm:space-y-4 px-3 sm:px-4 py-4 sm:py-6">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-2 h-9 px-2 sm:px-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-sm">Back</span>
        </Button>
        <ErrorState
          variant="inline"
          title="Error Loading Faculty"
          message={`Error loading faculty information. ${error?.message || ''}`}
          onRetry={() => window.location.reload()}
          showHome
          homeRoute="/admin/faculty-management"
        />
      </div>
    );
  }

  // Not found state
  if (!faculty) {
    return (
      <div className="w-full space-y-3 sm:space-y-4 px-3 sm:px-4 py-4 sm:py-6">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-2 h-9 px-2 sm:px-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-sm">Back</span>
        </Button>
        <Alert className="text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <AlertDescription className="ml-2 text-xs sm:text-sm">
            Faculty member not found. The faculty you're looking for doesn't exist.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)} variant="outline" className="w-full h-9">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Faculty List
        </Button>
      </div>
    );
  }

  // Utility functions
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

  // Course card component - mobile optimized
  const CourseCard = ({ course }) => (
    <Card 
      key={course.id} 
      className="group hover:shadow-sm sm:hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border-0 bg-muted/20 hover:bg-muted/40 active:bg-muted/50"
      onClick={() => navigate(`/admin/courses/${course.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/admin/courses/${course.id}`);
        }
      }}
    >
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-start gap-2 sm:gap-3">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-md object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-muted/80 transition-colors">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0 space-y-1.5">
            <div>
              <h3 className="font-semibold text-sm leading-tight break-words line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {course.title}
              </h3>
            </div>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
              {course.college && (
                <div className="inline-flex">
                  <Badge 
                    variant="secondary" 
                    className="text-xs h-5 px-2 inline-block w-auto max-w-full"
                  >
                    {course.college}
                  </Badge>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Badge variant="outline" className="text-xs h-5 px-2 flex items-center gap-0.5 flex-shrink-0">
                  <Users className="h-3 w-3" />
                  <span>{course._count?.enrollments || 0}</span>
                </Badge>
                <Badge
                  className={`text-xs h-5 px-2 flex-shrink-0 ${
                    course.status === 'PUBLISHED'
                      ? "bg-green-500/15 text-green-700 dark:text-green-400"
                      : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"
                  }`}
                >
                  {course.status === 'PUBLISHED' ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Empty state component - mobile optimized
  const EmptyState = ({ title, description }) => (
    <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-3 sm:px-4">
      <div className="p-2 sm:p-3 rounded-full bg-muted/40 mb-2 sm:mb-3">
        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground font-medium text-center">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1 text-center">{description}</p>}
    </div>
  );

  return (
    <div className="w-full space-y-3 sm:space-y-4 px-4 sm:px-6 max-w-7xl mx-auto py-3 sm:py-4">
      {/* Back Button */}
      <Button 
        onClick={() => navigate(-1)} 
        variant="ghost" 
        className="h-9 px-2 sm:px-3 text-sm hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5 sm:mr-2" />
        <span>Back</span>
      </Button>

      {/* Header Card - Faculty Info */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex gap-3 sm:gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-3 border-background shadow-md flex-shrink-0">
                <AvatarImage src={faculty.imageUrl} alt={faculty.fullName} />
                <AvatarFallback className="text-lg sm:text-xl font-bold bg-gradient-to-br from-primary to-primary/60 text-white">
                  {getInitials(faculty.fullName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight break-words">
                    {faculty.fullName}
                  </h1>
                </div>
                
                <div className="flex flex-col gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{faculty.emailAddress}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">Joined {formatDate(faculty.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Section */}
      <div className="space-y-3 sm:space-y-4">
        {/* Managed Courses */}
        <Card className="border-0 overflow-hidden flex flex-col">
          <CardHeader className="px-4 sm:px-6 py-3 border-b bg-muted/40">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-md bg-blue-500/10">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold">Managed Courses</h2>
                <p className="text-xs text-muted-foreground">
                  {faculty.managedCourses?.length || 0} course{(faculty.managedCourses?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <div className="px-3 sm:px-4 flex-1">
            {faculty.managedCourses?.length > 0 ? (
              <div className="space-y-2 py-3 sm:py-4">
                {faculty.managedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No managed courses yet" 
                description="Courses will appear here once assigned" 
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FacultyInfo;
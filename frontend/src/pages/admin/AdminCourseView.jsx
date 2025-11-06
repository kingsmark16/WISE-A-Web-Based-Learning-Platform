import { useParams, useNavigate } from "react-router-dom";
import { useGetCourse } from "../../hooks/courses/useCourses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";
import AdminCourseContentView from "../../components/AdminCourseContentView";

const AdminCourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCourse(courseId);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-0 w-full overflow-hidden">
        {/* Header with Back Button */}
        <div className="flex flex-row items-center justify-between gap-4">
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Main Course Card */}
        <Card className="shadow-lg overflow-hidden border-none bg-transparent">
          <CardContent className="px-0 w-full overflow-hidden">
            <div className="space-y-4 sm:space-y-6">
              {/* Mobile-first layout: thumbnail on top for small screens */}
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Thumbnail Skeleton - Mobile first (visible on mobile/tablet) */}
                <div className="block lg:hidden w-full">
                  <Skeleton className="h-48 sm:h-56 md:h-64 w-full rounded-lg" />
                </div>

                {/* Main Content and Desktop Thumbnail Row */}
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                  {/* Main Content Section - Full width on mobile, flex-1 on desktop */}
                  <div className="flex-1 space-y-4 sm:space-y-6">
                    {/* Title and Badges Skeleton */}
                    <div className="space-y-2 sm:space-y-3">
                      <Skeleton className="h-8 sm:h-9 w-3/4" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-7 sm:h-8 w-24 rounded-full" />
                        <Skeleton className="h-7 sm:h-8 w-20 rounded-full" />
                      </div>
                    </div>

                    {/* Course Code Skeleton */}
                    <div className="flex items-center gap-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-32 rounded-full" />
                    </div>

                    {/* Instructor and Last Updated Info Skeleton - Responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                      {/* Instructor Skeleton */}
                      <div className="flex items-start gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </div>

                      {/* Last Updated Skeleton */}
                      <div className="flex items-start gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <Skeleton className="h-2.5 w-20" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Skeleton - Desktop only */}
                  <div className="hidden lg:flex flex-col items-center flex-shrink-0">
                    <Skeleton className="w-64 h-64 rounded-lg" />
                  </div>
                </div>

                {/* Description Skeleton */}
                <div className="space-y-2 sm:space-y-3">
                  <Skeleton className="h-6 sm:h-7 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4 bg-destructive rounded-lg">
        Error loading course: {error.message}
      </div>
    );
  }

  const course = data?.course;

  if (!course) {
    return (
      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Course data not found. Please try again.</p>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mt-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-0 w-full overflow-hidden">
      {/* Header with Back Button */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Button
          onClick={() => navigate("/admin/courses")}
          variant="ghost"
          className="gap-2 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Courses</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      {/* Main Course Card */}
      <Card className="shadow-lg overflow-hidden border-none bg-transparent">
        <CardContent className="px-0 w-full overflow-hidden">
          <div className="space-y-4 sm:space-y-6">
            {/* Course Information Section */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Thumbnail - Mobile first (visible on mobile/tablet) */}
              <div className="block lg:hidden w-full">
                {course?.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course?.title}
                    className="h-48 sm:h-56 md:h-64 w-full rounded-lg object-cover shadow-md"
                  />
                ) : (
                  <div className="h-48 sm:h-56 md:h-64 w-full rounded-lg bg-muted/50 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-75" />
                      <p className="text-sm text-muted-foreground">No cover image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content and Desktop Thumbnail Row */}
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                {/* Main Content Section - Full width on mobile, flex-1 on desktop */}
                <div className="flex-1 space-y-4 sm:space-y-6">
                  {/* Title and Badges */}
                  <div className="space-y-2 sm:space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight break-words">
                      {course?.title || "Untitled Course"}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                        {course?.college || "No College"}
                      </Badge>
                      <Badge
                        variant={
                          course?.status === "PUBLISHED"
                            ? "default"
                            : course?.status === "ARCHIVED"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                      >
                        {course?.status || "DRAFT"}
                      </Badge>
                    </div>
                  </div>

                  {/* Course Code */}
                  {course?.code && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <span className="text-xs sm:text-sm text-muted-foreground font-medium whitespace-nowrap">
                        Course Code:
                      </span>
                      <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1.5 font-mono font-semibold">
                        {course.code}
                      </Badge>
                    </div>
                  )}

                  {/* Instructor and Last Updated Info - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 pt-2">
                    {/* Instructor */}
                    <div className="flex items-start gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Instructor</p>
                        {course?.managedBy ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarImage src={course.managedBy?.imageUrl} alt={course.managedBy?.fullName} />
                              <AvatarFallback className="text-xs">
                                {course.managedBy?.fullName?.split(" ").map(n => n[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate">{course.managedBy?.fullName || "Unknown"}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not assigned</span>
                        )}
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-start gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Last Updated</p>
                        <p className="text-sm font-medium">
                          {course.updatedAt
                            ? new Date(course.updatedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail - Desktop only */}
                <div className="hidden lg:flex flex-col items-center flex-shrink-0">
                  {course?.thumbnail ? (
                    <div className="relative group flex-shrink-0">
                      <img
                        src={course.thumbnail}
                        alt={course?.title}
                        className="h-64 w-auto rounded-lg object-cover shadow-md transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 rounded-lg bg-muted/50 flex items-center justify-center">
                      <div className="text-center">
                        <BookOpen className="h-16 w-16 mx-auto mb-3 text-muted-foreground opacity-75" />
                        <p className="text-sm text-muted-foreground font-medium">No cover image</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {course?.description && (
                <div className="space-y-2 sm:space-y-3 pt-2">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Description</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                </div>
              )}
            </div>

            {/* Course Content Navigation */}
            <AdminCourseContentView courseId={courseId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCourseView;

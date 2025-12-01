import { useParams, useNavigate } from "react-router-dom";
import { useGetCourse } from "../../hooks/courses/useCourses";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, BookOpen, CheckCircle2 } from "lucide-react";
import AdminCourseContentView from "../../components/AdminCourseContentView";

const AdminCourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCourse(courseId);

  if (isLoading) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
        </div>
        <Skeleton className="h-[300px] md:h-[400px] w-full rounded-xl" />
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-4">
            <Skeleton className="h-12 w-40 rounded-lg" />
            <Skeleton className="h-12 w-40 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
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
    <div className="space-y-6 w-full pb-10">
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

      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-xl bg-muted group shadow-md">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <BookOpen className="h-20 w-20 text-muted-foreground/20" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-none px-3 py-1 text-sm font-medium">
              {course.college || "No College"}
            </Badge>
            <Badge
                className={`px-3 py-1 text-sm font-medium border-none ${
                  course.status === 'PUBLISHED'
                    ? "bg-green-500/80 text-white"
                    : course.status === 'DRAFT'
                    ? "bg-yellow-500/80 text-white"
                    : "bg-gray-500/80 text-white"
                }`}
              >
                {course.status === 'PUBLISHED' ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Published
                  </span>
                ) : course.status === 'DRAFT' ? (
                  "Draft"
                ) : (
                  "Archived"
                )}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight max-w-4xl shadow-sm">
            {course.title || "Untitled Course"}
          </h1>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex flex-wrap gap-6 md:gap-8">
          {/* Instructor */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Instructor</p>
              {course.managedBy ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5 flex-shrink-0">
                    <AvatarImage src={course.managedBy?.imageUrl} alt={course.managedBy?.fullName} />
                    <AvatarFallback className="text-[10px]">
                      {course.managedBy?.fullName?.split(" ").map(n => n[0]).join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold">{course.managedBy?.fullName}</span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">Not assigned</span>
              )}
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Last Updated</p>
              <p className="text-sm font-semibold">
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

          {/* Course Code */}
          {course.code && (
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground font-medium">Course Code</p>
                  <code className="text-sm font-semibold font-mono">{course.code}</code>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div className="space-y-3 px-1">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            {course.description}
          </p>
        </div>
      )}

      {/* Course Content Navigation */}
      <div className="pt-2">
        <AdminCourseContentView courseId={courseId} />
      </div>
    </div>
  );
};

export default AdminCourseView;

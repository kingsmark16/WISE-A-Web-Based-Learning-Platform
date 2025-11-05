import { useParams, useNavigate } from "react-router-dom";
import { useGetCourse, usePublishCourse, useArchiveCourse } from "../../hooks/courses/useCourses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Archive, CheckCircle2, Copy, User } from "lucide-react";
import { useState } from "react";
import CourseContentNav from "../../components/CourseContentNav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ManageCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCourse(courseId);
  const [copied, setCopied] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const publishMutation = usePublishCourse();
  const archiveMutation = useArchiveCourse();

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
            <div className="flex flex-col gap-6">
              {/* Thumbnail and Course Info Row */}
              <div className="flex flex-row md:flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Course Information */}
                <div className="flex-1 space-y-6">
                  {/* Title and Badges */}
                  <div>
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 block lg:hidden mb-4" />
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>

                  {/* Instructor and Last Updated */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail */}
                <Skeleton className="w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 flex-shrink-0 hidden lg:block" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>

              {/* Course Content Navigation Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
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

  const handleEdit = () => navigate(`/faculty/courses/edit/${course.id}`);

  const handlePublishToggle = () => {
    publishMutation.mutate({
      id: course.id,
      status: course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
    });
  };

  const handleArchiveToggle = () => {
    if (course.status === 'ARCHIVED') {
      // Unarchive: move back to DRAFT
      publishMutation.mutate({
        id: course.id,
        status: 'DRAFT',
      });
    } else {
      // Archive: show confirmation dialog
      setShowArchiveDialog(true);
    }
  };

  const confirmArchive = () => {
    archiveMutation.mutate(course.id, {
      onSuccess: () => {
        setShowArchiveDialog(false);
      }
    });
  };

  const handleCopyCode = () => {
    if (course.code) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(course.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = course.code;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch (err) {
          console.error("Copy failed:", err);
        }
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-0 w-full overflow-hidden">
      {/* Header with Back Button */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="items-center gap-2 hover:bg-primary/5 hidden sm:flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Main Course Card */}
      <Card className="shadow-lg overflow-hidden border-none bg-transparent">
        <CardContent className="px-0 w-full overflow-hidden">
          <div className="flex flex-col gap-6">
            {/* Thumbnail and Course Info Row */}
            <div className="flex flex-row md:flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Course Information */}
              <div className="flex-1 space-y-6">
                {/* Title and Badges */}
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-2xl xl:text-2xl font-bold tracking-tight mb-3 sm:mb-4">
                    {course.title}
                  </h1>
                  {/* Thumbnail below title on small and medium screens */}
                  {course.thumbnail && (
                    <div className="relative group flex-shrink-0 block lg:hidden mb-4">
                      <div className="relative">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-auto max-w-48 sm:max-w-64 md:max-w-80 lg:max-w-96 rounded-lg object-cover shadow-md transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] group-hover:scale-[1.02]"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium bg-primary/10 text-primary border-none"
                    >
                      {course.college}
                    </Badge>
                    <Badge
                      className={`rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium ${
                        course.status === 'PUBLISHED'
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none"
                          : course.status === 'DRAFT'
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-none"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-none"
                      }`}
                    >
                      {course.status}
                    </Badge>
                  </div>
                </div>

                {/* Course Code */}
                {course.code && (
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Course Code:</span>
                    <Badge 
                      variant="outline" 
                      className="rounded-full px-4 py-2 font-mono text-sm font-semibold bg-background"
                    >
                      {course.code}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCode}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                      title="Copy code"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {copied && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Copied!
                      </span>
                    )}
                  </div>
                )}

                {/* Instructor */}
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Instructor</p>
                    {course.managedBy ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={course.managedBy?.imageUrl} alt={course.managedBy?.fullName} />
                          <AvatarFallback className="text-xs">
                            {course.managedBy?.fullName?.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{course.managedBy?.fullName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not assigned</span>
                    )}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
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

              {/* Thumbnail with Interactive Border */}
              {course.thumbnail && (
                <div className="relative group flex-shrink-0 hidden lg:block">
                  <div className="relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-auto max-w-48 sm:max-w-64 md:max-w-80 lg:max-w-96 rounded-lg object-cover shadow-md transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="secondary" 
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                variant={course.status === 'PUBLISHED' ? "outline" : "default"}
                onClick={handlePublishToggle}
                disabled={publishMutation.isPending || course.status === 'ARCHIVED'}
                className={`transition-all duration-200 ${
                  publishMutation.isPending
                    ? "opacity-70 cursor-not-allowed"
                    : course.status === 'PUBLISHED'
                    ? "text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                    : course.status === 'ARCHIVED'
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {publishMutation.isPending 
                  ? "Processing..." 
                  : course.status === 'PUBLISHED' 
                  ? "Unpublish" 
                  : course.status === 'ARCHIVED'
                  ? "Archived"
                  : "Publish"}
              </Button>
              <Button
                variant={course.status === 'ARCHIVED' ? "secondary" : "destructive"}
                onClick={handleArchiveToggle}
                disabled={archiveMutation.isPending || publishMutation.isPending}
                className={`gap-2 transition-all duration-200 ${
                  archiveMutation.isPending || publishMutation.isPending
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                <Archive className="h-4 w-4" />
                {course.status === 'ARCHIVED' ? "Unarchive" : "Archive"}
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-2 border-t pt-6">
              <h3 className="text-sm font-semibold text-foreground">About this course</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {course.description || "No description provided"}
              </p>
            </div>

            {/* Course Content Navigation */}
            <CourseContentNav courseId={courseId} />
          </div>
        </CardContent>
      </Card>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Archive className="h-5 w-5" />
              Archive Course
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this course? Archived courses cannot be published and will not be visible to students.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowArchiveDialog(false)}
              disabled={archiveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmArchive}
              disabled={archiveMutation.isPending}
            >
              {archiveMutation.isPending ? "Archiving..." : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCourse;

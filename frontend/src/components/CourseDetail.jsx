import { useParams, useNavigate } from "react-router-dom";
import { useGetCourse, usePublishCourse, useArchiveCourse } from "../hooks/courses/useCourses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, CheckCircle2, Calendar, User, BookOpen, Archive } from "lucide-react";
import { useState } from "react";
import CourseContentNav from "./CourseContentNav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCourse(id);
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

                    {/* Buttons Skeleton */}
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-10 sm:h-11 w-24" />
                      <Skeleton className="h-10 sm:h-11 w-24" />
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

                  {/* Thumbnail Skeleton - Desktop only, positioned below content */}
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

            {/* Course Content Navigation */}
            <div className="mt-2 w-full overflow-hidden">
              <CourseContentNav courseId={id} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <div className="text-destructive text-lg sm:text-xl font-semibold mb-2">Error loading course</div>
          <p className="text-muted-foreground text-sm sm:text-base">{error.message}</p>
        </div>
      </div>
    );
  }

  const course = data?.course;
  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center text-muted-foreground">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Course not found</p>
        </div>
      </div>
    );
  }

  const handleBack = () => navigate(-1);
  const handleEdit = () => navigate(`/admin/courses/edit/${course.id}`);

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
          variant="outline" 
          onClick={handleBack} 
          className="items-center gap-2 hover:bg-primary/5 hidden sm:flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Main Course Card */}
      <Card className="shadow-lg overflow-hidden border-none bg-transparent">
        <CardContent className="px-0 w-full overflow-hidden">
          <div className="space-y-4 sm:space-y-6">
            {/* Mobile-first layout: thumbnail on top for small screens */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Thumbnail - Mobile first (full width on mobile/tablet) */}
              <div className="block lg:hidden w-full">
                {course.thumbnail ? (
                  <div className="relative group flex-shrink-0 w-full">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-48 sm:h-56 md:h-64 w-full rounded-lg object-cover shadow-md transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] group-hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <div className="h-48 sm:h-56 md:h-64 w-full rounded-lg bg-muted/50 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="h-12 sm:h-14 w-12 sm:w-14 mx-auto mb-2 text-muted-foreground opacity-75" />
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">No cover image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content and Desktop Thumbnail Row */}
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                {/* Main Content Section - Full width on mobile, flex-1 on desktop */}
                <div className="flex-1 space-y-4 sm:space-y-6">
                  {/* Title and Badges */}
                  <div className="space-y-2 sm:space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {course.title}
                    </h1>
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
                  </div>

                  {/* Course Code */}
                  {course.code && (
                    <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Course Code:</span>
                      <Badge 
                        variant="outline" 
                        className="rounded-full px-3 py-1 font-mono text-xs bg-background"
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

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button 
                      className="h-10 sm:h-11 text-sm sm:text-base font-medium"
                      onClick={handleEdit}
                      variant="default"
                    >
                      Edit Course
                    </Button>
                    <Button
                      className="h-10 sm:h-11 text-sm sm:text-base font-medium"
                      onClick={handlePublishToggle}
                      disabled={publishMutation.isPending || course.status === 'ARCHIVED'}
                      variant="outline"
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
                      className="h-10 sm:h-11 text-sm sm:text-base font-medium"
                      onClick={handleArchiveToggle}
                      disabled={archiveMutation.isPending || publishMutation.isPending}
                      variant="outline"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      {course.status === 'ARCHIVED' ? "Unarchive" : "Archive"}
                    </Button>
                  </div>

                  {/* Instructor and Last Updated - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 pt-2">
                    {/* Instructor */}
                    <div className="flex items-start gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
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

                {/* Thumbnail - Desktop only, positioned below content */}
                <div className="hidden lg:flex flex-col items-center flex-shrink-0">
                  {course.thumbnail ? (
                    <div className="relative group flex-shrink-0">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
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
              {course.description && (
                <div className="space-y-2 sm:space-y-3 pt-2">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Description</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                </div>
              )}
            </div>

            {/* Course Content Navigation */}
            <CourseContentNav courseId={id} />
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

export default CourseDetail;
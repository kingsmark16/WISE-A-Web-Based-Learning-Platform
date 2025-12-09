import { useParams, useNavigate } from "react-router-dom";
import { useGetCourse, usePublishCourse, useArchiveCourse } from "../hooks/courses/useCourses";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
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
          <Skeleton className="h-10 w-32 rounded-lg" />
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
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <ErrorState
          variant="fullPage"
          title="Error Loading Course"
          message={error.message}
          onRetry={() => window.location.reload()}
          showBack
        />
      </div>
    );
  }

  const course = data?.course;
  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <ErrorState
          variant="fullPage"
          type="notFound"
          title="Course Not Found"
          message="The course you're looking for doesn't exist or has been removed."
          showBack
          showHome
          homeRoute="/admin"
        />
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
      publishMutation.mutate({
        id: course.id,
        status: 'DRAFT',
      });
    } else {
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
        // Fallback for older browsers
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
    <div className="space-y-6 w-full pb-10">
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

        {/* Top Badge - College */}
        <div className="absolute top-0 left-0 w-full p-6 md:p-8">
          <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-none px-3 py-1 text-sm font-medium whitespace-normal break-words">
            {course.college || "No College"}
          </Badge>
        </div>

        {/* Hero Content - Title at Bottom */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight max-w-4xl shadow-sm">
            {course.title}
          </h1>
        </div>
      </div>

      {/* Meta Bar & Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-card p-4 rounded-xl border shadow-sm">
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
                      {course.managedBy?.fullName?.split(" ").map(n => n[0]).join("")}
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
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold font-mono">{course.code}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyCode}
                      className="h-5 w-5 hover:bg-primary/10"
                      title="Copy code"
                    >
                      {copied ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 xl:pt-0">
          <Button 
            className="h-10 font-medium"
            onClick={handleEdit}
            variant="default"
          >
            Edit Course
          </Button>
          <Button
            className="h-10 font-medium"
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
            className="h-10 font-medium"
            onClick={handleArchiveToggle}
            disabled={archiveMutation.isPending || publishMutation.isPending}
            variant="outline"
          >
            <Archive className="h-4 w-4 mr-2" />
            {course.status === 'ARCHIVED' ? "Unarchive" : "Archive"}
          </Button>
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
        <CourseContentNav courseId={id} />
      </div>

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
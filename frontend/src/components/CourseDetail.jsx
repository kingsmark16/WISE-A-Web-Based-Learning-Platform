import { useParams, useNavigate } from "react-router-dom";
import { useGetCourse, usePublishCourse } from "../hooks/courses/useCourses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, UploadCloud, CloudOff } from "lucide-react";
import { useState } from "react";
import { Copy } from "lucide-react";
import { Users, MessageSquare, BookOpen, ChevronRight } from "lucide-react";
import CourseContentNav from "./CourseContentNav";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetCourse(id);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const publishMutation = usePublishCourse();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto mt-10">
        <Skeleton className="h-56 w-full mb-6" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-6 w-1/4 mb-2" />
      </div>
    );
  }
  if (error) return <div className="text-center text-destructive mt-10">{error.message}</div>;

  const course = data?.course;
  console.log(course)
  if (!course) return <div className="text-center text-muted-foreground mt-10">Course not found</div>;

  const handleBack = () => navigate(-1);

  const handleEdit = () => navigate(`/admin/courses/edit/${course.id}`);

  const handlePublishToggle = async () => {
    setPublishing(true);
    try {
      await publishMutation.mutateAsync({
        id: course.id,
        isPublished: !course.isPublished,
      });
      await refetch(); // Ensure course data is refreshed before updating UI
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyCode = () => {
    if (course.code) {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(course.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else {
        // Fallback for mobile/older browsers
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
          alert(err);
        }
        document.body.removeChild(textarea);
      }
    }
  };

  

  return (
    <div className="max-w-6xl mx-auto md:mt-5">
      <div className="mb-6 flex md:flex-row items-start md:items-center justify-between gap-4">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </Button>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={handleEdit} className="flex items-center gap-2">
            <Pencil size={18} />
            Edit
          </Button>
          <Button
            variant={course.isPublished ? "outline" : "default"}
            onClick={handlePublishToggle}
            disabled={publishing}
            className={`flex items-center gap-2 transition-all duration-200 ${
              publishing
                ? "opacity-70 cursor-not-allowed"
                : course.isPublished
                ? "border border-green-500 text-green-700 hover:bg-green-50"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {publishing ? (
              <>
                <UploadCloud size={18} className="animate-spin" />
              </>
            ) : course.isPublished ? (
              <>
                <CloudOff size={18} />
                <span>Unpublish</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Publish</span>
              </>
            )}
          </Button>
        </div>
      </div>
      <Card className="shadow-lg bg-background border-0 p-0">
        <CardHeader className="flex flex-col xl:flex-row md:justify-baseline gap-4 md:gap-8 pb-0 px-0">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="max-w-xl w-full h-auto object-contain rounded-lg md:mx-0 mb-4 md:mb-0"
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-xl md:text-2xl font-bold mb-4">{course.title}</CardTitle>
            <div className="flex flex-wrap gap-3 mb-4">
              {/* Modern shadcn badge for category */}
              <Badge
                variant="secondary"
                className="rounded-full px-4 py-1 text-sm font-medium bg-primary/10 text-primary border-none shadow-sm"
              >
                {course.category}
              </Badge>
              {/* Modern shadcn badge for status */}
              <Badge
                className={`rounded-full px-4 py-1 text-sm font-medium shadow-sm ${
                  course.isPublished
                    ? "bg-green-100 text-green-700 border-none"
                    : "bg-yellow-100 text-yellow-700 border-none"
                }`}
                variant="outline"
              >
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-semibold mb-2 text-sm">Instructor</h3>
                <div className="flex items-center gap-2 text-xs">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.managedBy?.imageUrl} alt={course.managedBy?.fullName} />
                    <AvatarFallback>
                      {course.managedBy?.fullName?.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-muted-foreground">{course.managedBy?.fullName || "Not assigned"}</span>
                </div>
              </div>
            </div>
            <div>
              {course.code && (
                <div className="flex items-center">
                  <span className="pr-2">Code:</span>
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-muted-foreground font-mono text-xs bg-muted/60">
                    {course.code}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyCode}
                    title="Copy code"
                  >
                    <Copy size={16} />
                  </Button>
                  {copied && (
                    <span className="text-xs text-muted-foreground ml-2">Copied!</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-sm">Description</h3>
              <div className="mb-6 text-muted-foreground">{course.description}</div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-sm">Last Updated</h3>
              <div className="mb-8 text-sm text-muted-foreground">
                {course.updatedAt
                  ? new Date(course.updatedAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </div>
            </div>

            {/* Navigation Section */}
              <CourseContentNav courseId={id}/>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetail;
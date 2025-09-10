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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetCourse(id);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
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
    await publishMutation.mutateAsync({
      id: course.id,
      isPublished: !course.isPublished,
    });
    setPublishing(false);
    refetch();
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

  const courseContent = (
    <div>
      <h4 className="font-semibold mb-2">Course Content</h4>
      <p className="text-muted-foreground">List of modules, lessons, or materials goes here.</p>
    </div>
  );
  const enrolledStudents = (
    <div>
      <h4 className="font-semibold mb-2">Enrolled Students</h4>
      <p className="text-muted-foreground">List of students enrolled in this course goes here.</p>
    </div>
  );
  const forum = (
    <div>
      <h4 className="font-semibold mb-2">Forum</h4>
      <p className="text-muted-foreground">Course discussion forum will be shown here.</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-6 mt-3 md:mt-10">
      
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
            variant={course.isPublished ? "destructive" : "default"}
            onClick={handlePublishToggle}
            disabled={publishing}
            className="flex items-center gap-2"
          >
            {course.isPublished ? <CloudOff size={18} /> : <UploadCloud size={18} />}
            {publishing
              ? "Processing..."
              : course.isPublished
              ? "Unpublish"
              : "Publish"}
          </Button>
        </div>
      </div>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row gap-8 md:gap-12 pb-0">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="max-w-xs w-full h-auto max-h-60 object-contain rounded-lg border mx-auto md:mx-0 mb-4 md:mb-0"
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-2xl md:text-3xl font-bold mb-4">{course.title}</CardTitle>
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="outline">{course.category}</Badge>
              <Badge className="text-foreground" variant="secondary">
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
              {course.code && (
                <div className="flex items-center">
                  <Badge variant="outline">Code: {course.code}</Badge>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-semibold mb-2 text-sm">Created By</h3>
                <div className="flex items-center gap-2 text-xs">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.createdBy?.imageUrl} alt={course.createdBy?.fullName} />
                    <AvatarFallback>
                      {course.createdBy?.fullName?.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{course.createdBy?.fullName || "Unknown"}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm">Instructor</h3>
                <div className="flex items-center gap-2 text-xs">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.managedBy?.imageUrl} alt={course.managedBy?.fullName} />
                    <AvatarFallback>
                      {course.managedBy?.fullName?.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{course.managedBy?.fullName || "Not assigned"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <h3 className="font-semibold mb-3 text-sm">Description</h3>
          <div className="mb-6 text-muted-foreground">{course.description}</div>
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
          {/* Tabs Section */}
          <div className="mt-4 md:mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="relative">
                <TabsList
                  className="w-full flex gap-2 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <TabsTrigger value="content" className="text-base md:text-lg px-4 py-2">Course Content</TabsTrigger>
                  <TabsTrigger value="students" className="text-base md:text-lg px-4 py-2">Enrolled Students</TabsTrigger>
                  <TabsTrigger value="forum" className="text-base md:text-lg px-4 py-2">Forum</TabsTrigger>
                </TabsList>
                {/* Scroll indicator for small screens */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center h-full pr-2 md:hidden">
                  <span className="bg-gradient-to-l from-muted to-transparent px-2 py-1 rounded-full flex items-center text-xs text-muted-foreground">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                      <path d="M7 4l5 5-5 5"/>
                    </svg>
                    Scroll
                  </span>
                </div>
              </div>
              <TabsContent value="content">
                <div className="md:p-6">{courseContent}</div>
              </TabsContent>
              <TabsContent value="students">
                <div className="md:p-6">{enrolledStudents}</div>
              </TabsContent>
              <TabsContent value="forum">
                <div className="md:p-6">{forum}</div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetail;
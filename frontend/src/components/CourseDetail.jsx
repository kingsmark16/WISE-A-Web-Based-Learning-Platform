import { useParams, useNavigate } from "react-router-dom";
import { useGetCourse, usePublishCourse } from "../hooks/courses/useCourses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, UploadCloud, CloudOff } from "lucide-react";
import { useState } from "react";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetCourse(id);
  const [publishing, setPublishing] = useState(false);
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

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <div className="flex gap-2 mb-6">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </Button>
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
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center gap-6">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-40 h-40 object-cover rounded-lg border"
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold mb-2">{course.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline">{course.category}</Badge>
              <Badge variant={course.isPublished ? "default" : "secondary"}>
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
              {course.code && (
                <Badge variant="outline">Code: {course.code}</Badge>
              )}
            </div>
            <div className="text-muted-foreground mb-2">{course.description}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Created By</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={course.createdBy?.imageUrl} alt={course.createdBy?.fullName} />
                  <AvatarFallback>
                    {course.createdBy?.fullName?.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{course.createdBy?.fullName || "Unknown"}</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Instructor</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={course.managedBy?.imageUrl} alt={course.managedBy?.fullName} />
                  <AvatarFallback>
                    {course.managedBy?.fullName?.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{course.managedBy?.fullName || "Not assigned"}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 text-sm text-muted-foreground">
            Last Updated:{" "}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetail;
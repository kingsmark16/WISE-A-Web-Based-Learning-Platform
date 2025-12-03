import { useParams, useNavigate } from "react-router-dom";
import { useCheckEnrollmentStatus, useGetSelectedCourse, useUnenrollInCourse } from "../../../hooks/courses/useCourses";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import UnenrollConfirmationDialog from "@/components/UnenrollConfirmationDialog";
import CourseTabs from "@/components/CourseTabs";
import toast from "react-hot-toast";

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: course, isLoading, error } = useGetSelectedCourse(id);
  const {data: enrollmentStatus, isLoading: isEnrollmentStatusLoading} = useCheckEnrollmentStatus(id);
  const {mutate: unenrollCourse, isPending: isUnenrollingCourse} = useUnenrollInCourse();

  const selectedCourse = course?.data;
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [isUnenrollingLocally, setIsUnenrollingLocally] = useState(false);

  useEffect(() => {
    if (!isEnrollmentStatusLoading && enrollmentStatus && !enrollmentStatus.isEnrolled) {
      navigate('/student/my-courses');
      toast.error("You must be enrolled to view this course.");
    }
  }, [isEnrollmentStatusLoading, enrollmentStatus, navigate]);

  const handleUnenrollConfirm = () => {
    setIsUnenrollingLocally(true);
    unenrollCourse(id, {
        onSuccess: () => {
            navigate('/student/my-courses');
        }
    });
    setUnenrollDialogOpen(false);
  };

  useEffect(() => {
    if (!isUnenrollingCourse) {
      setIsUnenrollingLocally(false);
    }
  }, [isUnenrollingCourse]);

  if (isEnrollmentStatusLoading || (enrollmentStatus && !enrollmentStatus.isEnrolled)) {
      return (
        <div className="space-y-6 w-full">
          {/* Hero Skeleton */}
          <div className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden">
            <Skeleton className="absolute inset-0 w-full h-full" />
            {/* College Badge Skeleton */}
            <div className="absolute top-0 left-0 w-full p-6 md:p-8">
              <Skeleton className="h-7 w-32 sm:w-40 rounded-full" />
            </div>
            {/* Title Skeleton */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
              <Skeleton className="h-8 sm:h-10 md:h-12 w-3/4 max-w-xl" />
            </div>
          </div>
          
          {/* Meta Bar Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex flex-wrap gap-6 md:gap-8">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>

          {/* Description Skeleton */}
          <div className="space-y-3 px-1">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      )
  }

  return (
    <div className="space-y-6 w-full pb-10">
        {isLoading ? (
          <div className="space-y-6">
            {/* Hero Skeleton */}
            <div className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden">
              <Skeleton className="absolute inset-0 w-full h-full" />
              {/* College Badge Skeleton */}
              <div className="absolute top-0 left-0 w-full p-6 md:p-8">
                <Skeleton className="h-7 w-32 sm:w-40 rounded-full" />
              </div>
              {/* Title Skeleton */}
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                <Skeleton className="h-8 sm:h-10 md:h-12 w-3/4 max-w-xl" />
              </div>
            </div>
            
            {/* Meta Bar Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-4 rounded-xl border shadow-sm">
              <div className="flex flex-wrap gap-6 md:gap-8">
                {/* Instructor Skeleton */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                {/* Last Updated Skeleton */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>
              {/* Unenroll Button Skeleton */}
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-3 px-1">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Tabs Skeleton */}
            <div className="pt-2 space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[60vh] p-4 border rounded-xl bg-muted/30">
            <div className="text-center">
              <div className="text-destructive text-lg sm:text-xl font-semibold mb-2">Failed to load course details</div>
              <p className="text-muted-foreground text-sm sm:text-base">{error.message}</p>
            </div>
          </div>
        ) : selectedCourse ? (
          <>
            {/* Hero Section */}
            <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-xl bg-muted group shadow-md">
              {selectedCourse.thumbnail ? (
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
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
                  {selectedCourse.college || "No College"}
                </Badge>
              </div>

              {/* Hero Content - Title at Bottom */}
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight max-w-4xl shadow-sm">
                  {selectedCourse.title}
                </h1>
              </div>
            </div>

            {/* Meta Bar & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-4 rounded-xl border shadow-sm">
              <div className="flex flex-wrap gap-6 md:gap-8">
                {/* Instructor */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {selectedCourse.managedBy?.imageUrl ? (
                      <img
                        src={selectedCourse.managedBy.imageUrl}
                        alt={selectedCourse.managedBy.fullName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Instructor</p>
                    <p className="text-sm font-semibold">
                      {selectedCourse.managedBy?.fullName || "Not assigned"}
                    </p>
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
                      {new Date(selectedCourse.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Unenroll Action */}
              <Button 
                onClick={() => setUnenrollDialogOpen(true)}
                disabled={isUnenrollingLocally || isUnenrollingCourse}
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isUnenrollingLocally || isUnenrollingCourse ? "Processing..." : "Unenroll"}
              </Button>
            </div>

            {/* Description */}
            {selectedCourse.description && (
              <div className="space-y-3 px-1">
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>
            )}

            {/* Course Content Tabs */}
            <div className="pt-2">
              <CourseTabs 
                courseId={id} 
                courseTitle={selectedCourse?.title} 
                certificateEnabled={selectedCourse?.certificateEnabled} 
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh] p-4">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">Course not found</p>
            </div>
          </div>
        )}

      {/* Course Unenrollment Confirmation Dialog */}
      <UnenrollConfirmationDialog
        open={unenrollDialogOpen}
        onOpenChange={setUnenrollDialogOpen}
        onConfirm={handleUnenrollConfirm}
        isLoading={isUnenrollingCourse}
        courseName={selectedCourse?.title || "this course"}
      />
    </div>
  );
};

export default CoursePage;
import { useParams, useNavigate } from "react-router-dom";
import { useCheckEnrollmentStatus, useGetSelectedCourse, useUnenrollInCourse } from "../../../hooks/courses/useCourses";
import { Card, CardContent } from "@/components/ui/card";
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
        <div className="space-y-4 sm:space-y-6 px-0 w-full overflow-hidden">
             <Skeleton className="h-64 w-full rounded-lg" />
             <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
             </div>
        </div>
      )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-0 w-full overflow-hidden">
      <Card className="shadow-lg overflow-hidden border-none bg-transparent">
        {isLoading ? (
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
                      </div>
                    </div>

                    {/* Instructor and Last Updated Info Skeleton - Responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                  {/* Thumbnail Skeleton - Desktop only, right side */}
                  <div className="hidden lg:flex flex-shrink-0 items-start">
                    <Skeleton className="w-80 h-96 rounded-lg" />
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
        ) : error ? (
          <div className="flex items-center justify-center min-h-[60vh] p-4">
            <div className="text-center">
              <div className="text-destructive text-lg sm:text-xl font-semibold mb-2">Failed to load course details</div>
              <p className="text-muted-foreground text-sm sm:text-base">{error.message}</p>
            </div>
          </div>
        ) : selectedCourse ? (
          <CardContent className="px-0 w-full overflow-hidden">
            <div className="space-y-4 sm:space-y-6">
              {/* Mobile-first layout: thumbnail on top for small screens */}
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Thumbnail - Mobile first (full width on mobile/tablet) */}
                <div className="block lg:hidden w-full">
                  {selectedCourse.thumbnail ? (
                    <div className="relative group flex-shrink-0 w-full">
                      <img
                        src={selectedCourse.thumbnail}
                        alt={selectedCourse.title}
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
                        {selectedCourse.title}
                      </h1>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium bg-primary/10 text-primary border-none"
                        >
                          {selectedCourse.college}
                        </Badge>
                      </div>
                    </div>

                    {/* Unenroll Button - Only if enrolled */}
                    <div className="flex gap-2 pt-1">
                      <Button 
                        className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base font-medium"
                        onClick={() => setUnenrollDialogOpen(true)}
                        disabled={isUnenrollingLocally || isUnenrollingCourse}
                        variant="destructive"
                      >
                        {isUnenrollingLocally || isUnenrollingCourse ? "Processing..." : "Unenroll"}
                      </Button>
                    </div>

                    {/* Instructor and Last Updated - Responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 pt-2">
                      {/* Instructor */}
                      <div className="flex items-start gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Instructor</p>
                          {selectedCourse.managedBy ? (
                            <div className="flex items-center gap-2">
                              {selectedCourse.managedBy?.imageUrl && (
                                <img
                                  src={selectedCourse.managedBy.imageUrl}
                                  alt={selectedCourse.managedBy.fullName}
                                  className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                                />
                              )}
                              <span className="text-sm font-medium truncate">{selectedCourse.managedBy?.fullName}</span>
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
                            {new Date(selectedCourse.updatedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail - Desktop only, positioned below content */}
                  <div className="hidden lg:flex flex-col items-center flex-shrink-0">
                    {selectedCourse.thumbnail ? (
                      <div className="relative group flex-shrink-0">
                        <img
                          src={selectedCourse.thumbnail}
                          alt={selectedCourse.title}
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
                {selectedCourse.description && (
                  <div className="space-y-2 sm:space-y-3 pt-2">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground">Description</h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {selectedCourse.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Course Content - Always show since we redirect if not enrolled */}
              <CourseTabs courseId={id} courseTitle={selectedCourse?.title} certificateEnabled={selectedCourse?.certificateEnabled} />
            </div>
          </CardContent>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh] p-4">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">Course not found</p>
            </div>
          </div>
        )}
      </Card>

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
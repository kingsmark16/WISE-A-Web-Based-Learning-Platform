import { useParams } from "react-router-dom";
import { useCheckEnrollmentStatus, useEnrollInCourse, useGetSelectedCourse, useUnenrollInCourse } from "../../../hooks/courses/useCourses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import CourseEnrollDialog from "@/components/CourseEnrollDialog";
import UnenrollConfirmationDialog from "@/components/UnenrollConfirmationDialog";
import CourseTabs from "@/components/CourseTabs";

const CoursePage = () => {
  const { id } = useParams();
  const { data: course, isLoading, error } = useGetSelectedCourse(id);
  const {data: enrollmentStatus, isLoading: isEnrollmentStatusLoading} = useCheckEnrollmentStatus(id);
  const {mutate: enrollCourse, isPending: isEnrollingCourse} = useEnrollInCourse();
  const {mutate: unenrollCourse, isPending: isUnenrollingCourse} = useUnenrollInCourse();

  const selectedCourse = course?.data;
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [isUnenrollingLocally, setIsUnenrollingLocally] = useState(false);

  const handleEnrollment = () => {
    if(enrollmentStatus?.isEnrolled){
        // Open the confirmation dialog for unenrollment
        setUnenrollDialogOpen(true);
    }else{
        // Open the dialog for course code entry
        setEnrollDialogOpen(true);
    }
  }

  const handleEnrollConfirm = (courseCode) => {
    enrollCourse({ courseId: id, courseCode }, {
      onSuccess: () => {
        setEnrollDialogOpen(false);
      },
      onError: () => {
        // Dialog stays open on error so user can try again
      }
    });
  };

  const handleUnenrollConfirm = () => {
    setIsUnenrollingLocally(true);
    unenrollCourse(id);
    setUnenrollDialogOpen(false);
  };

  useEffect(() => {
    if (!isUnenrollingCourse) {
      setIsUnenrollingLocally(false);
    }
  }, [isUnenrollingCourse]);

  return (
    <div className="space-y-4 sm:space-y-6 px-0 w-full overflow-hidden">
      <Card className="shadow-lg overflow-hidden border-none bg-transparent">
        {isLoading ? (
          <CardContent className="px-0 w-full overflow-hidden">
            <div className="flex flex-col gap-6">
              {/* Thumbnail and Course Info Row */}
              <div className="flex flex-row md:flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Course Information */}
                <div className="flex-1 space-y-6">
                  {/* Title and Badges */}
                  <div>
                    <Skeleton className="h-8 sm:h-9 w-2/3 mb-3 sm:mb-4" />
                    
                    {/* Thumbnail skeleton below title on small and medium screens */}
                    <div className="block lg:hidden mb-4 w-full">
                      <Skeleton className="h-48 w-full sm:max-w-64 md:max-w-80 rounded-lg" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Skeleton className="h-7 w-32 rounded-full" />
                    </div>
                    
                    {/* Enroll Button Skeleton */}
                    <Skeleton className="h-10 w-32 rounded-md" />
                  </div>

                  {/* Instructor and Last Updated */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Instructor Skeleton */}
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>

                    {/* Last Updated Skeleton */}
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Skeleton - hidden on small/medium, visible on large */}
                <div className="hidden lg:block flex-shrink-0">
                  <Skeleton className="h-80 max-w-96 rounded-lg" />
                </div>
              </div>

              {/* Description Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
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
            <div className="flex flex-col gap-6">
              {/* Thumbnail and Course Info Row */}
              <div className="flex flex-row md:flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Course Information */}
                <div className="flex-1 space-y-6">
                  {/* Title and Badges */}
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-2xl xl:text-2xl font-bold tracking-tight mb-3 sm:mb-4">
                      {selectedCourse.title}
                    </h1>
                    {/* Thumbnail below title on small and medium screens */}
                    {selectedCourse.thumbnail && (
                      <div className="relative group flex-shrink-0 block lg:hidden mb-4 w-full">
                        <div className="relative">
                          <img
                            src={selectedCourse.thumbnail}
                            alt={selectedCourse.title}
                            className="h-auto w-full sm:max-w-64 md:max-w-80 lg:max-w-96 rounded-lg object-cover shadow-md transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] group-hover:scale-[1.02]"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="secondary"
                        className="rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium bg-primary/10 text-primary border-none"
                      >
                        {selectedCourse.college}
                      </Badge>
                    </div>
                    {/* Enroll Button */}
                    <div className="flex gap-2">
                      <Button 
                        className="w-full sm:w-auto h-10 text-sm md:text-base font-medium"
                        onClick={handleEnrollment}
                        disabled={isUnenrollingLocally || isUnenrollingCourse || isEnrollmentStatusLoading}
                        variant={enrollmentStatus?.isEnrolled ? "destructive" : "default"}
                      >
                        {(isUnenrollingLocally || isUnenrollingCourse) ? (
                            "Processing..."
                        ): enrollmentStatus?.isEnrolled ? (
                            "Unenroll"
                        ): (
                            "Enroll Now"
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Instructor and Last Updated */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Instructor */}
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
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
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
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

                {/* Thumbnail with Interactive Border */}
                {selectedCourse.thumbnail && (
                  <div className="relative group flex-shrink-0 hidden lg:block">
                    <div className="relative">
                      <img
                        src={selectedCourse.thumbnail}
                        alt={selectedCourse.title}
                        className="h-auto max-w-48 sm:max-w-64 md:max-w-80 lg:max-w-96 rounded-lg object-cover shadow-md transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] group-hover:scale-[1.02]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedCourse.description && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">Description</h2>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>
              )}

              {/* Course Content - Only show if enrolled */}
              {!isEnrollmentStatusLoading && enrollmentStatus?.isEnrolled && (
                <CourseTabs courseId={id} courseTitle={selectedCourse?.title} />
              )}
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

      {/* Locked Course Content */}
      {!isEnrollmentStatusLoading && !enrollmentStatus?.isEnrolled && selectedCourse && (
        <Card className="shadow-lg border-none bg-muted/20">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Course Content Locked</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You need to enroll in this course to access the modules, forum, and other course content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Enrollment Dialog */}
      <CourseEnrollDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        onConfirm={handleEnrollConfirm}
        isLoading={isEnrollingCourse}
        courseName={selectedCourse?.title || "this course"}
      />

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
import { useParams } from "react-router-dom";
import { useCheckEnrollmentStatus, useEnrollInCourse, useGetSelectedCourse, useUnenrollInCourse } from "../../../hooks/courses/useCourses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Users, Calendar, BookOpen, Award, BarChart3 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import CourseEnrollDialog from "@/components/CourseEnrollDialog";
import UnenrollConfirmationDialog from "@/components/UnenrollConfirmationDialog";

const CoursePage = () => {
  const { id } = useParams();
  const { data: course, isLoading, error } = useGetSelectedCourse(id);
  const {data: enrollmentStatus, isLoading: isEnrollmentStatusLoading} = useCheckEnrollmentStatus(id);
  const {mutate: enrollCourse, isPending: isEnrollingCourse} = useEnrollInCourse();
  const {mutate: unenrollCourse, isPending: isUnenrollingCourse} = useUnenrollInCourse();

  const selectedCourse = course?.data;
  const [tab, setTab] = useState("info");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [isUnenrollingLocally, setIsUnenrollingLocally] = useState(false);
  const scrollContainerRef = useRef(null);

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


  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -120, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-0 w-full overflow-hidden">
      <Card className="shadow-lg overflow-hidden border-none bg-transparent">
        {isLoading ? (
          <div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-0 w-full">
              <Skeleton className="h-48 md:h-80 w-full md:w-1/2 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-0">
                <Skeleton className="h-8 md:h-9 w-2/3" />
                <Skeleton className="h-4 md:h-5 w-1/3" />
                <Skeleton className="h-4 md:h-5 w-full" />
                <Skeleton className="h-4 md:h-5 w-5/6" />
                <Skeleton className="h-4 md:h-5 w-4/6" />
              </div>
            </div>
          </div>
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
                      <div className="relative group flex-shrink-0 block lg:hidden mb-4">
                        <div className="relative">
                          <img
                            src={selectedCourse.thumbnail}
                            alt={selectedCourse.title}
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
                        {selectedCourse.category}
                      </Badge>
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

              {/* Action Button */}
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

              {/* Description */}
              {selectedCourse.description && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>
              )}

              {/* Course Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Students Enrolled */}
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Students Enrolled</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {selectedCourse._count?.enrollments || 0}
                    </p>
                  </div>
                </div>

                {/* Modules */}
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Modules</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {selectedCourse._count?.modules || 0}
                    </p>
                  </div>
                </div>

                {/* Total Lessons */}
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Lessons</p>
                    <p className="text-sm sm:text-base font-medium">
                      {selectedCourse.totalLessons || 0}
                    </p>
                  </div>
                </div>
              </div>

              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <div className="relative flex items-center">
                  {/* Left Arrow - only visible on small screens */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-80 z-10 md:hidden bg-background/80 backdrop-blur-sm h-9 w-8"
                    onClick={scrollRight}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-80 z-10 md:hidden bg-background/80 backdrop-blur-sm h-9 w-8"
                    onClick={scrollLeft}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>

                  <div 
                    ref={scrollContainerRef}
                    className="overflow-x-auto scrollbar-hide md:overflow-visible px-8 md:px-10 lg:px-0 w-full"
                  >
                    <TabsList className="flex bg-muted mb-4 md:mb-6 min-w-max md:w-full h-9 md:h-10 gap-1 md:gap-2 p-1">
                      <TabsTrigger value="info" className="text-xs sm:text-sm md:text-sm whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2">
                        Info
                      </TabsTrigger>
                      <TabsTrigger value="stream" className="text-xs sm:text-sm md:text-sm whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2">
                        Stream
                      </TabsTrigger>
                      <TabsTrigger value="certification" className="text-xs sm:text-sm md:text-sm whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2">
                        Certification
                      </TabsTrigger>
                       <TabsTrigger value="students" className="text-xs sm:text-sm md:text-sm whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2">
                        Students
                      </TabsTrigger>
                       <TabsTrigger value="forum" className="text-xs sm:text-sm md:text-sm whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2">
                        Forum
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="info" className="w-full">
                  <div className="p-4 md:p-6 text-center text-muted-foreground text-sm md:text-base">
                    Additional course information will be shown here.
                  </div>
                </TabsContent>

                <TabsContent value="students" className="w-full">
                  <div className="p-4 md:p-6 text-center text-muted-foreground text-sm md:text-base">
                    Students will be shown here.
                  </div>
                </TabsContent>

                <TabsContent value="stream" className="w-full">
                  <div className="p-4 md:p-6 text-center text-muted-foreground text-sm md:text-base">
                    Chapters will be shown here.
                  </div>
                </TabsContent>
                <TabsContent value="forum" className="w-full">
                  <div className="p-4 md:p-6 text-center text-muted-foreground text-sm md:text-base">
                    Forum will be shown here.
                  </div>
                </TabsContent>
                <TabsContent value="certification" className="w-full">
                  <div className="p-4 md:p-6 text-center text-muted-foreground text-sm md:text-base">
                    Certification details will be shown here.
                  </div>
                </TabsContent>
              </Tabs>
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
import { useParams } from "react-router-dom";
import { useCheckEnrollmentStatus, useEnrollInCourse, useGetSelectedCourse } from "../../hooks/courses/useCourses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

const CoursePage = () => {
  const { id } = useParams();
  const { data: course, isLoading, error } = useGetSelectedCourse(id);
  const {data: enrollmentStatus, isLoading: isEnrollmentStatusLoading, error: enrollmentStatusError} = useCheckEnrollmentStatus(id);
  const {mutate: enrollCourse, isPending: isEnrollingCourse, error: errorEnrollCourse } = useEnrollInCourse();

  const selectedCourse = course?.data;
  const [tab, setTab] = useState("info");
  const scrollContainerRef = useRef(null);

  const handleEnrollment = () => {
    if(enrollmentStatus?.isEnrolled){
        console.log('Enrolled');
    }else{
        enrollCourse(id);
    }
  }

  useEffect(() => {
    if(enrollmentStatusError) {
      toast.error(enrollmentStatusError?.response?.data?.message || 'Failed to check enrollment status');
    }
    if(errorEnrollCourse) {
      toast.error(errorEnrollCourse?.response?.data?.message || 'Failed to enroll in course');
    }
  }, [enrollmentStatusError, errorEnrollCourse]);


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
    <div className="min-h-screen">
      <Card className="max-w-6xl mx-auto shadow-xl border-none rounded-2xl bg-muted/40">
        {isLoading ? (
          <div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-8">
              <Skeleton className="h-48 md:h-80 w-full md:w-1/2 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-4 md:space-y-6">
                <Skeleton className="h-8 md:h-10 w-2/3" />
                <Skeleton className="h-4 md:h-6 w-1/3" />
                <Skeleton className="h-4 md:h-5 w-full" />
                <Skeleton className="h-4 md:h-5 w-5/6" />
                <Skeleton className="h-4 md:h-5 w-4/6" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 md:p-12 text-center text-destructive text-base md:text-lg">
            Failed to load course details.
          </div>
        ) : selectedCourse ? (
          <>
            <CardHeader className="pb-0 p-4 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="w-full md:w-1/2 h-48 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
                  {selectedCourse.thumbnail ? (
                    <img
                      src={selectedCourse.thumbnail}
                      alt={selectedCourse.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-5xl md:text-6xl lg:text-8xl text-primary/40">🎓</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-2 md:py-4 min-w-0">
                  <div className="space-y-4 md:space-y-6">
                    <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-primary leading-tight">
                      {selectedCourse.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 w-fit">
                      {selectedCourse.category}
                    </Badge>
                    <div className="text-sm md:text-base text-muted-foreground">
                      Last updated:{" "}
                      {new Date(selectedCourse.updatedAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center gap-3 md:gap-4">
                      {selectedCourse.managedBy?.imageUrl && (
                        <img
                          src={selectedCourse.managedBy.imageUrl}
                          alt={selectedCourse.managedBy.fullName}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-primary text-base md:text-lg">
                          {selectedCourse.managedBy?.fullName || "Unknown"}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          Instructor
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-6 md:mt-8 h-10 md:h-12 text-base md:text-lg" size="lg"
                    onClick={handleEnrollment}
                    disabled={isEnrollingCourse || isEnrollmentStatusLoading}
                    variant={enrollmentStatus?.isEnrolled ? "destructive" : "default"}
                  >
                    {isEnrollingCourse ? (
                        "Processing..."
                    ): enrollmentStatus?.isEnrolled ? (
                        "Unenroll"
                    ): (
                        "Enroll Now"
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 md:px-8 pt-4 md:pt-6 pb-6 md:pb-8">
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <div className="relative flex items-center">
                  {/* Left Arrow - only visible on small screens */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-80 z-10 md:hidden bg-background/80 backdrop-blur-sm h-10 md:h-12 w-8 md:w-10"
                    onClick={scrollRight}
                  >
                    <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-80 z-10 md:hidden bg-background/80 backdrop-blur-sm h-10 md:h-12 w-8 md:w-10"
                    onClick={scrollLeft}
                  >
                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>

                  {/* Right Arrow - only visible on small screens */}
                  

                  <div 
                    ref={scrollContainerRef}
                    className="overflow-x-auto scrollbar-hide md:overflow-visible px-8 md:px-10 lg:px-0 w-full"
                  >
                    <TabsList className="flex bg-muted mb-4 md:mb-6 min-w-max md:w-full h-10 md:h-12 gap-1 md:gap-2 p-1 md:p-2">
                      <TabsTrigger value="info" className="text-xs sm:text-sm md:text-base whitespace-nowrap px-4 md:px-6 py-2 md:py-3">
                        Info
                      </TabsTrigger>
                      <TabsTrigger value="stream" className="text-xs sm:text-sm md:text-base whitespace-nowrap px-4 md:px-6 py-2 md:py-3">
                        Stream
                      </TabsTrigger>
                      <TabsTrigger value="certification" className="text-xs sm:text-sm md:text-base whitespace-nowrap px-4 md:px-6 py-2 md:py-3">
                        Certification
                      </TabsTrigger>
                       <TabsTrigger value="students" className="text-xs sm:text-sm md:text-base whitespace-nowrap px-4 md:px-6 py-2 md:py-3">
                        Students
                      </TabsTrigger>
                       <TabsTrigger value="forum" className="text-xs sm:text-sm md:text-base whitespace-nowrap px-4 md:px-6 py-2 md:py-3">
                        Forum
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="info" className="w-full">
                  <div className="p-6 md:p-8 text-center text-muted-foreground text-base md:text-lg">
                    Additional course information will be shown here.
                  </div>
                </TabsContent>

                <TabsContent value="students" className="w-full">
                  <div className="p-6 md:p-8 text-center text-muted-foreground text-base md:text-lg">
                    Students will be shown here.
                  </div>
                </TabsContent>

                <TabsContent value="stream" className="w-full">
                  <div className="p-6 md:p-8 text-center text-muted-foreground text-base md:text-lg">
                    Chapters will be shown here.
                  </div>
                </TabsContent>
                <TabsContent value="forum" className="w-full">
                  <div className="p-6 md:p-8 text-center text-muted-foreground text-base md:text-lg">
                    Forum will be shown here.
                  </div>
                </TabsContent>
                <TabsContent value="certification" className="w-full">
                  <div className="p-6 md:p-8 text-center text-muted-foreground text-base md:text-lg">
                    Certification details will be shown here.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        ) : (
          <div className="p-8 md:p-12 text-center text-muted-foreground text-base md:text-lg">
            Course not found.
          </div>
        )}
      </Card>
    </div>
  );
};

export default CoursePage;
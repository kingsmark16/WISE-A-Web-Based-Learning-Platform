import * as React from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const CoursesCarousel = ({ 
  title, 
  courses = [], 
  isLoading = false, 
  error = null,
  onCourseClick = null 
}) => {
  const navigate = useNavigate();
  const [api, setApi] = React.useState()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    // Use the actual number of courses as the count for dots
    setCount(courses.length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api, courses.length])

  const handleCourseClick = (course) => {
    if (onCourseClick) {
      onCourseClick(course);
    } else {
      navigate(`/student/homepage/${course.id}/selected-course`);
    }
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, idx) => (
        <CarouselItem key={idx} className="pl-2 sm:pl-3 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
          <Card className="h-96 sm:h-80 border">
            <Skeleton className="h-40 sm:h-32 rounded-t-lg w-full" />
            <CardContent className="p-3 sm:p-4 space-y-3">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </CardContent>
          </Card>
        </CarouselItem>
      ))}
    </>
  );

  return (
    <section className="w-full mb-6 sm:mb-8 md:mb-10 px-2 sm:px-4 md:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">
          {title}
        </h2>
        {/* Arrow indicator for more items */}
        {courses.length > 1 && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
            <span>Swipe or scroll</span>
            <svg className="w-4 h-4 animate-pulse flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-80 bg-destructive/10 rounded-lg">
          <span className="text-destructive text-sm sm:text-base">Error loading courses. Please try again.</span>
        </div>
      )}

      {/* Empty State */}
      {!error && courses.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-80 bg-muted rounded-lg">
          <span className="text-muted-foreground text-sm sm:text-base">No courses found.</span>
        </div>
      )}

      {/* Carousel */}
      {!error && (courses.length > 0 || isLoading) && (
        <div className="relative user-select-none">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
              skipSnaps: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-4">
              {isLoading ? (
                renderLoadingSkeleton()
              ) : (
                courses.map((course) => (
                  <CarouselItem 
                    key={course.id}
                    className="pl-2 sm:pl-3 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 2xl:basis-1/5"
                  >
                    <div
                      onClick={() => handleCourseClick(course)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleCourseClick(course);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="h-full focus:outline-none rounded-lg user-select-none"
                    >
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col border p-0 rounded-lg">
                        {/* Thumbnail */}
                        <div className="h-40 sm:h-52 md:h-56 overflow-hidden bg-muted flex items-center justify-center relative flex-shrink-0">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>

                        {/* Content */}
                        <CardContent className="p-2 sm:p-3 md:p-4 flex flex-col justify-between flex-1 space-y-1 sm:space-y-2 overflow-hidden">
                          <div className="min-h-fit">
                            <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate mt-0.5 sm:mt-1">
                              {course.college}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {course.managedBy?.fullName || "No instructor"}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>

            {/* Navigation Buttons - Hidden */}
            {/* Removed default carousel arrows */}
          </Carousel>

          {/* Pagination Dots */}
          {courses.length > 1 && !isLoading && (
            <div className="flex justify-center gap-1 mt-3 sm:mt-4 md:mt-5">
              {Array.from({ length: count }, (_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={`rounded-full transition-all duration-300 flex-shrink-0 ${
                    i + 1 === current
                      ? "h-2 w-6 sm:w-8 bg-primary shadow-md"
                      : "h-2 w-2 bg-muted hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i + 1 === current}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CoursesCarousel;

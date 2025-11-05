import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useNavigate } from "react-router-dom"
import { BookOpen } from "lucide-react"

const CARD_WIDTH = "w-[280px]"
const CARD_HEIGHT = "h-[300px]"
const THUMBNAIL_HEIGHT = "h-[180px]"

const CoursesCarousel = ({ 
  title, 
  courses = [], 
  isLoading = false, 
  error = null,
  onCourseClick = null 
}) => {
  const navigate = useNavigate();

  const handleCourseClick = (course) => {
    if (onCourseClick) {
      onCourseClick(course);
    } else {
      navigate(`/student/homepage/${course.id}/selected-course`);
    }
  };

  return (
    <section className="mb-8">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-md font-semibold text-foreground mb-2">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="scroll-smooth -ml-2 md:-ml-4">
              {isLoading ? (
                [...Array(5)].map((_, idx) => (
                  <CarouselItem
                    key={idx}
                    className="pl-2 md:pl-4 cursor-pointer select-none basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
                  >
                    <Card className={`${CARD_HEIGHT} flex flex-col w-full`}>
                      <Skeleton className={`rounded-t-xl w-full ${THUMBNAIL_HEIGHT}`} />
                      <div className="p-4 flex-1">
                        <Skeleton className="h-5 w-3/4 rounded mb-2" />
                        <Skeleton className="h-4 w-1/2 rounded mb-2" />
                        <Skeleton className="h-4 w-2/3 rounded" />
                      </div>
                    </Card>
                  </CarouselItem>
                ))
              ) : error ? (
                <CarouselItem className="pl-2 md:pl-4 basis-full">
                  <span className="text-destructive">
                    Error loading courses.
                  </span>
                </CarouselItem>
              ) : courses.length === 0 ? (
                <CarouselItem className="pl-2 md:pl-4 basis-full">
                  <span className="text-muted-foreground">
                    No courses found.
                  </span>
                </CarouselItem>
              ) : (
                courses.map((course) => (
                  <CarouselItem
                    key={course.id}
                    className="pl-2 md:pl-4 cursor-pointer select-none basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
                  >
                    <div
                      onClick={() => handleCourseClick(course)}
                      role="button"
                      tabIndex={0}
                      className="h-full"
                      style={{ outline: "none" }}
                    >
                      <Card className={`hover:shadow-xl transition-shadow duration-200 group ${CARD_HEIGHT} flex flex-col p-0 w-full`}>
                        <div className={`rounded-t-xl overflow-hidden flex items-center justify-center bg-muted ${THUMBNAIL_HEIGHT}`}>
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <BookOpen className="w-12 h-12 text-slate-400" />
                          )}
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-sm text-primary mb-2 truncate">
                              {course.title}
                            </h3>
                            <p className="text-muted-foreground text-xs mb-3 truncate">
                              {course.college}
                            </p>
                            <p className="text-muted-foreground text-xs truncate">
                              {course.managedBy?.fullName || "No instructor"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
          </Carousel>
        </CardContent>
      </Card>
    </section>
  )
}

export default CoursesCarousel

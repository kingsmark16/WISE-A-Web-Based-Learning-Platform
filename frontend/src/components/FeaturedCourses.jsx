import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useNavigate } from "react-router-dom"

const CARD_WIDTH = "w-[280px]" // Fixed width, increased from responsive
const CARD_HEIGHT = "h-[300px]" // Fixed height, no responsive variants
const THUMBNAIL_HEIGHT = "h-[180px]" // Fixed height, no responsive variants

const FeaturedCourses = ({featCourses, featuredCoursesLoading, featuredCoursesError}) => {
  const navigate = useNavigate();

  return (
    <section className="mb-8">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-md font-semibold text-primary mb-2">
            Featured Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="scroll-smooth -ml-2 md:-ml-4">
              {featuredCoursesLoading ? (
                [...Array(5)].map((_, idx) => (
                  <CarouselItem
                    key={idx}
                    className="pl-2 md:pl-4 cursor-pointer select-none basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
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
              ) : featuredCoursesError ? (
                <CarouselItem className="pl-2 md:pl-4 basis-full">
                  <span className="text-destructive">
                    Error loading featured courses.
                  </span>
                </CarouselItem>
              ) : featCourses.length === 0 ? (
                <CarouselItem className="pl-2 md:pl-4 basis-full">
                  <span className="text-muted-foreground">
                    No featured courses found.
                  </span>
                </CarouselItem>
              ) : (
                featCourses.map((course) => (
                  <CarouselItem
                    key={course.id}
                    className="pl-2 md:pl-4 cursor-pointer select-none basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
                  >
                    <div
                      onClick={() => navigate(`/student/homepage/${course.id}/selected-course`)}
                      role="button"
                      tabIndex={0}
                      className="h-full"
                      style={{ outline: "none" }}
                    >
                      <Card className={`hover:shadow-xl transition-shadow duration-200 group ${CARD_HEIGHT} flex flex-col p-0 w-full`}>
                        <div className={`rounded-t-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 ${THUMBNAIL_HEIGHT}`}>
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <span className="text-4xl text-primary/40">🎓</span>
                          )}
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-sm text-primary mb-2 truncate">
                              {course.title}
                            </h3>
                            <p className="text-muted-foreground text-xs mb-3 truncate">
                              {course.category}
                            </p>
                            <p className="text-muted-foreground text-xs truncate">
                              {course.managedby || "Unknown"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </CardContent>
      </Card>
    </section>
  )
}

export default FeaturedCourses
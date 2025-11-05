import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { BookOpen } from "lucide-react"
import CoursesCarousel from "./CoursesCarousel"

const FeaturedCourses = ({featCourses, featuredCoursesLoading, featuredCoursesError}) => {
  return (
    <CoursesCarousel 
      title="Featured Courses"
      courses={featCourses}
      isLoading={featuredCoursesLoading}
      error={featuredCoursesError}
    />
  )
}

export default FeaturedCourses
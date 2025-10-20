import { useGetCategories } from "../../../hooks/useGetCategories"
import FeaturedCourses from "../../../components/FeaturedCourses"
import { useGetFeaturedCourses } from "../../../hooks/courses/useCourses"
import Categories from "../../../components/Categories"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Zap } from "lucide-react"

const HomePage = () => {
    
    const { data: categories, isLoading: loadingCategories, error: errorCategories } = useGetCategories();
    const categoryList = categories?.data || [];

    const { data: featuredCourses, isLoading: featuredCoursesLoading, error: featuredCoursesError } = useGetFeaturedCourses();
    const featCourses = featuredCourses?.data || [];

    return (
        <div className="space-y-6">
            {/* Hero Information Section */}
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome to WISE</h1>
                    <p className="text-md text-muted-foreground">Your gateway to quality education and skill development</p>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {/* Card 1: Explore Courses */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                </div>
                                <CardTitle className="text-md font-semibold">Explore Courses</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-md text-muted-foreground">Discover a wide range of courses designed to help you achieve your learning goals</p>
                        </CardContent>
                    </Card>

                    {/* Card 3: Join Community */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <Users className="h-4 w-4 text-green-600 dark:text-green-300" />
                                </div>
                                <CardTitle className="text-md font-semibold">Join Community</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-md text-muted-foreground">Connect with peers, participate in forums, and collaborate on learning</p>
                        </CardContent>
                    </Card>

                    {/* Card 4: Accelerate Learning */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                    <Zap className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                                </div>
                                <CardTitle className="text-md font-semibold">Learn Faster</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-md text-muted-foreground">Use interactive lessons, quizzes, and personalized feedback to accelerate your learning</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <FeaturedCourses featCourses={featCourses} featuredCoursesLoading={featuredCoursesLoading} featuredCoursesError={featuredCoursesError}/>
            {/* Categories Section */}
            <Categories categoryList={categoryList} loadingCategories={loadingCategories} errorCategories={errorCategories}/>
        </div>
    );
}

export default HomePage
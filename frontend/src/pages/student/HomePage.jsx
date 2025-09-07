import { useGetCategories } from "../../hooks/useGetCategories"
import FeaturedCourses from "../../components/FeaturedCourses"
import { useGetFeaturedCourses } from "../../hooks/courses/useCourses"
import Categories from "../../components/Categories"

const HomePage = () => {
    
    const { data: categories, isLoading: loadingCategories, error: errorCategories } = useGetCategories();
    const categoryList = categories?.data || [];

    const { data: featuredCourses, isLoading: featuredCoursesLoading, error: featuredCoursesError } = useGetFeaturedCourses();
    const featCourses = featuredCourses?.data || [];

    return (
        <div className="max-w-6xl mx-auto py-10">

            <FeaturedCourses featCourses={featCourses} featuredCoursesLoading={featuredCoursesLoading} featuredCoursesError={featuredCoursesError}/>
    

            {/* Categories Section */}
            <Categories categoryList={categoryList} loadingCategories={loadingCategories} errorCategories={errorCategories}/>

            {/* Main Home Content */}
        </div>
    );
}

export default HomePage
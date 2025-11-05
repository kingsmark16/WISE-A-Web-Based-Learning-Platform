import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const Categories = ({categoryList, loadingCategories, errorCategories}) => {
  const navigate = useNavigate();

  const handleCollegeClick = (college) => {
    navigate(`/student/search?college=${encodeURIComponent(college)}`);
  };

  return (
    <Card className="mb-8">
        <CardHeader>
            <CardTitle className="text-md font-semibold text-primary">Colleges</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-4 justify-baseline">
                {loadingCategories ? (
                [...Array(6)].map((_, idx) => (
                    <Skeleton key={idx} className="h-10 w-32 rounded-full" />
                ))
                ) : errorCategories ? (
                    <span className="text-destructive">Error loading colleges.</span>
                ) : categoryList.length === 0 ? (
                    <span className="text-muted-foreground">No colleges found.</span>
                ) : (
                    categoryList.map((category) => (
                        <Button
                            key={category}
                            variant="outline"
                            onClick={() => handleCollegeClick(category)}
                            className="rounded-full px-6 py-2 font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                            {category}
                        </Button>
                    ))
                )}
            </div>
        </CardContent>
    </Card>
  )
}

export default Categories
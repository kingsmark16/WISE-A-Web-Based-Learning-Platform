import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Categories = ({ categories, onCategoryClick, activeCategory }) => {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-base md:text-base">Categories</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {categories.map((category) => (
            <div
              key={category.name}
              onClick={() => onCategoryClick?.(category.name)}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                activeCategory === category.name 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'hover:bg-accent'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div style={{ backgroundColor: category.color }} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0" />
                <span className="text-sm sm:text-sm md:text-sm font-medium truncate">{category.name}</span>
              </div>
              <Badge 
                variant={activeCategory === category.name ? "default" : "secondary"} 
                className="text-xs sm:text-xs md:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5 flex-shrink-0 ml-2"
              >
                {category.count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Categories;
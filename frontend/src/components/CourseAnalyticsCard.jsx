import { BarChart3, BookOpen, FileText, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CourseAnalyticsCard = () => {

    const cardContent = [
        {
            title: "Total Modules",
            total: 8,
            icon: <BookOpen className="h-4 w-4"/>,
            colorStyle: "bg-blue-100 text-blue-600"
        },
        {
            title: "Total Lessons",
            total: 24,
            icon: <FileText className="h-4 w-4"/>,
            colorStyle: "bg-green-100 text-green-600"
        },
        {
            title: "Total Quizzes",
            total: 8,
            icon: <HelpCircle className="h-4 w-4"/>,
            colorStyle: "bg-purple-100 text-purple-600"
        },
        {
            title: "Avg. Completion",
            total: 8,
            icon: <BarChart3 className="h-4 w-4"/>,
            colorStyle: "bg-orange-100 text-orange-600"
        }

    ]


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cardContent.map((item) => (
        <Card key={item.title} className="p-4 min-w-[140px] flex-1">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.colorStyle}`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground truncate">{item.title}</p>
              <p className="text-lg md:text-2xl font-bold">{item.total}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default CourseAnalyticsCard
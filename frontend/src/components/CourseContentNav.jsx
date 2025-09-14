import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, ExternalLink, MessageSquare, Users } from "lucide-react";
import CourseAnalyticsCard from "./CourseAnalyticsCard";
import ModuleContent from "./ModuleContent";

const CourseContentNav = () => {

  

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-6 text-lg">Course Sections</h3>

      {/* Simple Tab Navigation */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Students</span>
          </TabsTrigger>
          <TabsTrigger value="forum" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Forum</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-lg">Course Content</h4>
            </div>
          </div>

          {/* Analytics Cards */}
          <CourseAnalyticsCard/>

          {/* Module Content with Analytics */}
          <ModuleContent/>

        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CourseContentNav
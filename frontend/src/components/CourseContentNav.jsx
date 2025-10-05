import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, ExternalLink, MessageSquare, Users } from "lucide-react";
import ModuleContent from "./courseNav/ModuleContent";
import Forum from "./courseNav/Forum";

const CourseContentNav = ({ courseId }) => {
  console.log("CourseContentNav - courseId:", courseId);

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
          {/* Module Content with Analytics */}
          <ModuleContent />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {/* Students content - to be implemented */}
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Students list coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="forum" className="space-y-4">
          {/* Forum with courseId prop */}
          <Forum courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseContentNav;
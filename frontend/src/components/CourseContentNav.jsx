import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, ExternalLink, MessageSquare, Users } from "lucide-react";
import ModuleContent from "./courseNav/ModuleContent";
import Forum from "./courseNav/Forum";
import { useState } from "react";

const CourseContentNav = ({ courseId }) => {
  const [activeTab, setActiveTab] = useState("content");

  return (
    <div className="mt-8 w-full overflow-hidden">
      <h3 className="font-semibold mb-6 text-lg">Course Sections</h3>

      {/* Interactive Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger 
            value="content" 
            className="flex items-center gap-2 transition-all duration-200 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger 
            value="students" 
            className="flex items-center gap-2 transition-all duration-200 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Students</span>
          </TabsTrigger>
          <TabsTrigger 
            value="forum" 
            className="flex items-center gap-2 transition-all duration-200 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Forum</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent 
          value="content" 
          className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 w-full overflow-hidden"
        >
          {/* Module Content with Analytics */}
          <ModuleContent />
        </TabsContent>

        <TabsContent 
          value="students" 
          className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
        >
          {/* Students content - to be implemented */}
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p className="animate-in fade-in-0 slide-in-from-bottom-1 duration-500">Students list coming soon</p>
          </div>
        </TabsContent>

        <TabsContent 
          value="forum" 
          className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
        >
          {/* Forum with courseId prop */}
          <Forum courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseContentNav;
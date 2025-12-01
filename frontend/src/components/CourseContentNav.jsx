import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, MessageSquare, Users } from "lucide-react";
import ModuleContent from "./courseNav/ModuleContent";
import Forum from "./courseNav/Forum";
import FacultyCourseStudents from "./faculty/FacultyCourseStudents";
import { useState } from "react";

const CourseContentNav = ({ courseId }) => {
  const [activeTab, setActiveTab] = useState("content");

  const tabConfig = [
    { value: "content", label: "Content", icon: BookOpen },
    { value: "students", label: "Students Assessment", icon: Users },
    { value: "forum", label: "Forum", icon: MessageSquare },
  ];

  return (
    <div className="w-full mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        
        {/* Navigation Container */}
        <div className="mb-8">
            <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <TabsList className="h-auto p-1.5 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-full gap-1 inline-flex">
                    {tabConfig.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="
                                    relative flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                                    data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md
                                    data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-background/50 data-[state=inactive]:hover:text-foreground
                                "
                            >
                                <Icon className="w-4 h-4" />
                                <span className="whitespace-nowrap">{tab.label}</span>
                            </TabsTrigger>
                        )
                    })}
                </TabsList>
            </div>
        </div>

        {/* Content Sections */}
        <div className="min-h-[400px]">
            <TabsContent value="content" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <ModuleContent />
            </TabsContent>

            <TabsContent value="students" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <FacultyCourseStudents courseId={courseId} />
            </TabsContent>

            <TabsContent value="forum" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <Forum courseId={courseId} />
            </TabsContent>
        </div>

      </Tabs>
    </div>
  );
};

export default CourseContentNav;
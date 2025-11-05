import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, ExternalLink, MessageSquare, Users } from "lucide-react";
import ModuleContent from "./courseNav/ModuleContent";
import Forum from "./courseNav/Forum";
import FacultyCourseStudents from "./faculty/FacultyCourseStudents";
import { useState } from "react";

const CourseContentNav = ({ courseId }) => {
  const [activeTab, setActiveTab] = useState("content");

  const tabConfig = [
    { value: "content", label: "Content", icon: BookOpen },
    { value: "students", label: "Students", icon: Users },
    { value: "forum", label: "Forum", icon: MessageSquare },
  ];

  return (
    <div className="mt-8 w-full overflow-hidden">
      {/* Interactive Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-hidden">
        <div className="relative border-t border-b border-l border-r border-border -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <TabsList className="flex bg-transparent mb-0 w-full h-auto gap-1 p-0 justify-stretch">
              {tabConfig.map((tabItem) => {
                const IconComponent = tabItem.icon;
                const isActive = activeTab === tabItem.value;
                
                return (
                  <TabsTrigger
                    key={tabItem.value}
                    value={tabItem.value}
                    className={`relative flex-1 group text-sm sm:text-sm md:text-base whitespace-nowrap px-2 sm:px-4 md:px-6 py-3 md:py-4 font-medium transition-all duration-300 rounded-lg
                      ${isActive 
                        ? 'bg-primary/10 text-primary shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                      }
                    `}
                  >
                    {/* Background glow effect on active */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-lg -z-10" />
                    )}
                    
                    {/* Icon */}
                    <IconComponent className="hidden sm:inline-block w-4 h-4 sm:w-4 sm:h-4 mr-1 sm:mr-2 transition-transform group-hover:scale-110" />
                    
                    {/* Label */}
                    <span>{tabItem.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        <TabsContent 
          value="content" 
          className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 w-full overflow-hidden mt-6"
        >
          {/* Module Content with Analytics */}
          <ModuleContent />
        </TabsContent>

        <TabsContent 
          value="students" 
          className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 mt-6"
        >
          {/* Students list with action buttons */}
          <FacultyCourseStudents courseId={courseId} />
        </TabsContent>

        <TabsContent 
          value="forum" 
          className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 mt-6"
        >
          {/* Forum with courseId prop */}
          <Forum courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseContentNav;
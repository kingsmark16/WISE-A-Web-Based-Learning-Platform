
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, MessageSquare, Users, Award, Lock } from "lucide-react";
import ModuleAccordion from "./ModuleAccordion";
import Forum from "./courseNav/Forum";
import CertificationTab from "./student/CertificationTab";
import StudentsList from "./student/StudentsList";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CourseTabs = ({ courseId, courseTitle, certificateEnabled }) => {
  const [tab, setTab] = useState("module");

  const tabConfig = [
    { value: "module", label: "Modules", icon: BookOpen, mobileLabel: "Module" },
    { value: "forum", label: "Forum", icon: MessageSquare, mobileLabel: "Forum" },
    { value: "students", label: "Students", icon: Users, mobileLabel: "Students" },
    { value: "certification", label: "Certification", icon: Award, mobileLabel: "Certification" },
  ];

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className="relative border-t border-b border-l border-r border-border -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="flex bg-transparent mb-0 w-full h-auto gap-1 p-0 justify-stretch">
            {tabConfig.map((tabItem) => {
              const IconComponent = tabItem.icon;
              const isActive = tab === tabItem.value;
              
              const isDisabled = tabItem.value === 'certification' && !certificateEnabled;
              
              const triggerContent = (
                <>
                  {/* Background glow effect on active */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-lg -z-10" />
                  )}
                  
                  {/* Icon */}
                  <IconComponent className="hidden sm:inline-block w-4 h-4 sm:w-4 sm:h-4 mr-1 sm:mr-2 transition-transform group-hover:scale-110" />
                  
                  {/* Label */}
                  <span className="hidden sm:inline">{tabItem.label}</span>
                  <span className="sm:hidden">{tabItem.mobileLabel}</span>

                  {/* Lock Icon for disabled state */}
                  {isDisabled && (
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 inline-block text-muted-foreground/70" />
                  )}
                </>
              );

              const triggerClass = `relative flex-1 group text-sm sm:text-sm md:text-base whitespace-nowrap px-2 sm:px-4 md:px-6 py-3 md:py-4 font-medium transition-all duration-300 rounded-lg
                    ${isDisabled
                      ? 'opacity-50' 
                      : isActive 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'}
                  `;

              if (isDisabled) {
                return (
                  <TooltipProvider key={tabItem.value}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div className="flex-1 cursor-not-allowed">
                          <TabsTrigger
                            value={tabItem.value}
                            disabled={true}
                            className={`${triggerClass} w-full`}
                          >
                            {triggerContent}
                          </TabsTrigger>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Certification is disabled for this course</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }

              return (
                <TabsTrigger
                  key={tabItem.value}
                  value={tabItem.value}
                  disabled={isDisabled}
                  className={triggerClass}
                >
                  {triggerContent}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>

      <TabsContent value="module" className="w-full">
        <ModuleAccordion courseId={courseId} />
      </TabsContent>

      <TabsContent value="forum" className="w-full">
        <Forum courseId={courseId} />
      </TabsContent>

      <TabsContent value="students" className="w-full">
        <StudentsList courseId={courseId} />
      </TabsContent>

      <TabsContent value="certification" className="w-full">
        <CertificationTab courseId={courseId} courseTitle={courseTitle} certificateEnabled={certificateEnabled} />
      </TabsContent>
    </Tabs>
  );
};

export default CourseTabs;
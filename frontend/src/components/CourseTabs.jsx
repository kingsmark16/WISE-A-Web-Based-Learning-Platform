
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
    { value: "module", label: "Modules", icon: BookOpen },
    { value: "forum", label: "Forum", icon: MessageSquare },
    { value: "students", label: "Students", icon: Users },
    { value: "certification", label: "Certification", icon: Award },
  ];

  return (
    <div className="w-full mt-8">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        
        {/* Navigation Container */}
        <div className="mb-8 w-full">
            <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <TabsList className="h-auto p-1 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-full gap-1 flex w-full sm:w-auto min-w-fit">
                    {tabConfig.map((tabItem) => {
                        const Icon = tabItem.icon;
                        const isDisabled = tabItem.value === 'certification' && !certificateEnabled;
                        
                        if (isDisabled) {
                            return (
                                <TooltipProvider key={tabItem.value}>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <div className="relative flex-1 sm:flex-none">
                                                <TabsTrigger
                                                    value={tabItem.value}
                                                    disabled={true}
                                                    className="
                                                        relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 w-full sm:w-auto
                                                        opacity-50 cursor-not-allowed
                                                        data-[state=inactive]:text-muted-foreground
                                                    "
                                                >
                                                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span className="whitespace-nowrap">{tabItem.label}</span>
                                                    <Lock className="w-3 h-3 ml-0.5" />
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
                                className="
                                    relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex-1 sm:flex-none
                                    data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md
                                    data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-background/50 data-[state=inactive]:hover:text-foreground
                                "
                            >
                                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="whitespace-nowrap">{tabItem.label}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </div>
        </div>

        {/* Content Sections */}
        <div className="min-h-[400px]">
            <TabsContent value="module" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <ModuleAccordion courseId={courseId} />
            </TabsContent>

            <TabsContent value="forum" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <Forum courseId={courseId} />
            </TabsContent>

            <TabsContent value="students" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <StudentsList courseId={courseId} />
            </TabsContent>

            <TabsContent value="certification" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <CertificationTab courseId={courseId} courseTitle={courseTitle} certificateEnabled={certificateEnabled} />
            </TabsContent>
        </div>

      </Tabs>
    </div>
  );
};

export default CourseTabs;
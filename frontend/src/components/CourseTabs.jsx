import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ModuleAccordion from "./ModuleAccordion";
import Forum from "./courseNav/Forum";
import CertificationTab from "./student/CertificationTab";

const CourseTabs = ({ courseId, courseTitle }) => {
  const [tab, setTab] = useState("module");

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className="flex items-center">
        <div className="overflow-x-auto scrollbar-hide md:overflow-visible px-8 md:px-10 lg:px-0 w-full">
          <TabsList className="flex bg-muted mb-4 md:mb-6 min-w-max md:w-full h-9 md:h-10 gap-1 md:gap-2 p-1">
            <TabsTrigger value="module" className="text-xs sm:text-sm md:text-sm whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2">
              Module
            </TabsTrigger>
            <TabsTrigger value="forum" className="text-xs sm:text-sm md:text-sm whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2">
              Forum
            </TabsTrigger>
            <TabsTrigger value="students" className="text-xs sm:text-sm md:text-sm whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2">
              Students
            </TabsTrigger>
            <TabsTrigger value="certification" className="text-xs sm:text-sm md:text-sm whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2">
              Certification
            </TabsTrigger>
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
        <div className="p-4 md:p-6 text-center text-muted-foreground text-sm md:text-base">
          Students will be shown here.
        </div>
      </TabsContent>

      <TabsContent value="certification" className="w-full">
        <CertificationTab courseId={courseId} courseTitle={courseTitle} />
      </TabsContent>
    </Tabs>
  );
};

export default CourseTabs;
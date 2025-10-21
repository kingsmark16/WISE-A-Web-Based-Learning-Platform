import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ModuleAccordion from "./ModuleAccordion";

const CourseTabs = ({ courseId }) => {
  const [tab, setTab] = useState("module");
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -120, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 120, behavior: 'smooth' });
    }
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className="relative flex items-center">
        {/* Left Arrow - only visible on small screens */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-80 z-10 md:hidden bg-background/80 backdrop-blur-sm h-9 w-8"
          onClick={scrollRight}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-80 z-10 md:hidden bg-background/80 backdrop-blur-sm h-9 w-8"
          onClick={scrollLeft}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide md:overflow-visible px-8 md:px-10 lg:px-0 w-full"
        >
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
        <div className="p-4 md:p-6 text-center text-muted-foreground text-sm md:text-base">
          Forum will be shown here.
        </div>
      </TabsContent>

      <TabsContent value="students" className="w-full">
        <div className="p-4 md:p-6 text-center text-muted-foreground text-sm md:text-base">
          Students will be shown here.
        </div>
      </TabsContent>

      <TabsContent value="certification" className="w-full">
        <div className="p-4 md:p-6 text-center text-muted-foreground text-sm md:text-base">
          Certification details will be shown here.
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CourseTabs;
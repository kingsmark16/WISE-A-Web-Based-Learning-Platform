import { useModulesForStudent } from "@/hooks/student/useModulesForStudent";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, AlertCircle, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Loading skeleton component
const ModulesSkeleton = () => (
  <div className="space-y-3 p-4 md:p-6">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-16 w-full rounded-lg" />
    ))}
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="p-4 md:p-6 text-center text-muted-foreground">
    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
    <p>No modules available yet.</p>
  </div>
);

// Error state component
const ErrorState = ({ error, onRetry }) => (
  <Alert variant="destructive" className="m-4 md:m-6">
    <AlertCircle className="h-4 w-4" />
    <div className="flex items-center justify-between w-full">
      <AlertDescription>
        {error?.response?.data?.message || error?.message || 'Failed to fetch modules'}
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="ml-2"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  </Alert>
);

// Module item component
const ModuleItem = ({ module }) => (
  <AccordionItem
    key={module.id}
    value={module.id}
    className="border rounded-lg bg-card hover:bg-accent/50 transition-colors"
  >
    <AccordionTrigger className="hover:no-underline px-4 py-3 md:py-4">
      <div className="flex items-center gap-3 text-left flex-1">
        <div className="flex-shrink-0 bg-primary/10 rounded-lg p-2">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm md:text-base truncate">
              {module.title}
            </span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded whitespace-nowrap">
              {module.totalLessons} lesson{module.totalLessons !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Updated: {new Date(module.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </AccordionTrigger>
    <AccordionContent className="px-4 py-3 md:py-4 border-t text-sm text-muted-foreground">
      <div className="space-y-2">
        <p>Module content will be displayed here.</p>
        <p className="text-xs">
          This module has {module.totalLessons} lesson{module.totalLessons !== 1 ? "s" : ""} to complete.
        </p>
      </div>
    </AccordionContent>
  </AccordionItem>
);

// Main component
const ModuleAccordion = ({ courseId }) => {
  const { data: modules = [], isLoading, error, refetch } = useModulesForStudent(courseId);

  if (isLoading) {
    return <ModulesSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (modules.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="p-4 md:p-6">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {modules.map((module) => (
          <ModuleItem key={module.id} module={module} />
        ))}
      </Accordion>
    </div>
  );
};

export default ModuleAccordion;

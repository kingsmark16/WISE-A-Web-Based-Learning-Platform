import { useModulesForStudent } from "@/hooks/student/useModulesForStudent";
import { useStudentModuleDetails } from "@/hooks/student/useStudentModuleDetails";
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
import { useState, useCallback } from "react";
import StudentLessonsList from "@/components/student/StudentLessonsList";
import StudentLinksList from "@/components/student/StudentLinksList";
import StudentQuizSection from "@/components/student/StudentQuizSection";
import PdfViewer from "@/components/PdfViewer";
import EmbedYt from "@/components/EmbedYt";
import VideoPlayer from "@/components/VideoPlayer";

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

// Module content component with lazy loading
const ModuleContentDisplay = ({ courseId, moduleId }) => {
  const { data: moduleDetails, isLoading, error, refetch } = useStudentModuleDetails(
    courseId,
    moduleId,
    true
  );

  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [pdfPlayerOpen, setPdfPlayerOpen] = useState(false);
  const [dropboxPlayerOpen, setDropboxPlayerOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);

  const handlePlayLesson = useCallback((lesson) => {
    const type = String(lesson?.type || '').toUpperCase();
    const url = lesson?.url;

    if (!url) {
      console.error('Lesson URL not available');
      return;
    }

    if (type === 'PDF') {
      setCurrentLesson(lesson);
      setPdfPlayerOpen(true);
    } else if (type === 'YOUTUBE') {
      setCurrentLesson(lesson);
      setVideoPlayerOpen(true);
    } else if (type === 'DROPBOX') {
      setCurrentLesson(lesson);
      setDropboxPlayerOpen(true);
    } else {
      // Fallback for unknown types
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleOpenLink = useCallback((link) => {
    // Handle link open - already opens in new tab
    console.log('Opened link:', link);
  }, []);

  const handleStartQuiz = useCallback((quiz) => {
    // Handle quiz start - can navigate to quiz page
    console.log('Starting quiz:', quiz);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.response?.data?.message || error?.message || 'Failed to load module content'}
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          onClick={refetch}
          className="ml-2 mt-2"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </Alert>
    );
  }

  if (!moduleDetails) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No module details available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Description */}
      {moduleDetails.description && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Description</h3>
          <div className="p-3 md:p-4 rounded-lg bg-muted/40 border border-input">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {moduleDetails.description}
            </p>
          </div>
        </div>
      )}

      {/* Lessons Section */}
      {moduleDetails.lessons && moduleDetails.lessons.length > 0 && (
        <StudentLessonsList
          lessons={moduleDetails.lessons}
          isLoading={false}
          onPlayLesson={handlePlayLesson}
        />
      )}

      {/* Links Section */}
      {moduleDetails.links && moduleDetails.links.length > 0 && (
        <StudentLinksList
          links={moduleDetails.links}
          isLoading={false}
          onOpenLink={handleOpenLink}
        />
      )}

      {/* Quiz Section */}
      {moduleDetails.quiz && (
        <StudentQuizSection
          quiz={moduleDetails.quiz}
          courseId={courseId}
          moduleId={moduleId}
          isLoading={false}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {/* Empty State */}
      {(!moduleDetails.lessons || moduleDetails.lessons.length === 0) &&
        (!moduleDetails.links || moduleDetails.links.length === 0) &&
        !moduleDetails.quiz && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No content available in this module yet.</p>
          </div>
        )}

      {/* PDF Viewer Modal */}
      <PdfViewer 
        open={pdfPlayerOpen} 
        onClose={() => setPdfPlayerOpen(false)} 
        pdfUrl={currentLesson?.url}
      />

      {/* YouTube Video Player Modal */}
      <EmbedYt 
        open={videoPlayerOpen} 
        onOpenChange={setVideoPlayerOpen} 
        lesson={currentLesson}
      />

      {/* Dropbox Video Player Modal */}
      <VideoPlayer 
        open={dropboxPlayerOpen} 
        onClose={() => setDropboxPlayerOpen(false)} 
        url={currentLesson?.url}
        title={currentLesson?.title}
      />
    </div>
  );
};

// Module item component
const ModuleItem = ({ module, courseId, index }) => {
  return (
    <div className="relative rounded-lg border-2 border-input shadow-lg hover:shadow-xl transition-all duration-200 hover:border-primary/30 [&.open]:border-primary/50 w-full bg-card overflow-clip">
      <AccordionItem
        value={module.id}
        className="border-0"
      >
      <AccordionTrigger
        className="group py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-6 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 hover:bg-accent/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]]:border-b [&[data-state=open]]:border-border w-full overflow-hidden hover:no-underline"
      >
        <div className="flex items-center gap-3 text-left flex-1">
          <div className="flex-shrink-0 bg-primary/10 rounded-lg p-2">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm md:text-base truncate">
                Module {index + 1}: {module.title}
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
      <AccordionContent className="px-4 py-3 md:py-4 border-t">
        <ModuleContentDisplay
          courseId={courseId}
          moduleId={module.id}
        />
      </AccordionContent>
    </AccordionItem>
    </div>
  );
};

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
        {modules.map((module, index) => (
          <ModuleItem key={module.id} module={module} courseId={courseId} index={index} />
        ))}
      </Accordion>
      <div className="h-4" />
    </div>
  );
};

export default ModuleAccordion;

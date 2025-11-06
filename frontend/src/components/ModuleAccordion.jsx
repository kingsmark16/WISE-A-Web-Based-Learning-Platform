import { useModulesForStudent } from "@/hooks/student/useModulesForStudent";
import { useStudentModuleDetails } from "@/hooks/student/useStudentModuleDetails";
import { useTrackLessonAccess } from "@/hooks/student/useTrackLessonAccess";
import { useStudentCourseProgress } from "@/hooks/student/useStudentCourseProgress";
import { useQueryClient } from "@tanstack/react-query";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BookOpen, AlertCircle, RotateCcw, Lock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import StudentLessonsList from "@/components/student/StudentLessonsList";
import StudentLinksList from "@/components/student/StudentLinksList";
import StudentQuizSection from "@/components/student/StudentQuizSection";
import PdfViewer from "@/components/PdfViewer";
import EmbedYt from "@/components/EmbedYt";
import VideoPlayer from "@/components/VideoPlayer";

// Loading skeleton component
const ModulesSkeleton = () => (
  <div className="space-y-3 px-3 sm:px-4 md:px-6 py-4 md:py-6">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-16 w-full rounded-lg" />
    ))}
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="px-3 sm:px-4 md:px-6 py-4 md:py-6 text-center text-muted-foreground">
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

  const trackLessonAccess = useTrackLessonAccess(courseId, moduleId);
  const queryClient = useQueryClient();

  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [pdfPlayerOpen, setPdfPlayerOpen] = useState(false);
  const [dropboxPlayerOpen, setDropboxPlayerOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);

  // Handle visibility change to refetch data when user comes back from PDF tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User came back to the tab, refetch module details
        queryClient.invalidateQueries({
          queryKey: ['student-module-details', courseId, moduleId],
          exact: true
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [courseId, moduleId, queryClient]);

  const handlePlayLesson = useCallback((lesson) => {
    const type = String(lesson?.type || '').toUpperCase();
    const url = lesson?.url;

    if (!url) {
      console.error('Lesson URL not available');
      return;
    }

    // Track lesson access - this will mark it as completed
    trackLessonAccess.mutate(lesson.id, {
      onError: (error) => {
        if (error.response?.status === 403 && error.response?.data?.isLocked) {
          alert('This module is locked. Complete the previous module first.');
          return;
        }
        console.error('Failed to track lesson access:', error);
        alert('Failed to track lesson access. Please try again.');
      },
      onSuccess: () => {
        console.log('Lesson access tracked successfully');
      }
    });

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
  }, [trackLessonAccess]);

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
          <div className="p-3 md:p-4">
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
        onClose={() => {
          setPdfPlayerOpen(false);
          // Refetch data when modal closes
          queryClient.invalidateQueries({
            queryKey: ['student-module-details', courseId, moduleId],
            exact: true
          });
        }}
        pdfUrl={currentLesson?.url}
      />

      {/* YouTube Video Player Modal */}
      <EmbedYt 
        open={videoPlayerOpen} 
        onOpenChange={(open) => {
          setVideoPlayerOpen(open);
          // Refetch data when modal closes
          if (!open) {
            queryClient.invalidateQueries({
              queryKey: ['student-module-details', courseId, moduleId],
              exact: true
            });
          }
        }}
        lesson={currentLesson}
      />

      {/* Dropbox Video Player Modal */}
      <VideoPlayer 
        open={dropboxPlayerOpen} 
        onClose={() => {
          setDropboxPlayerOpen(false);
          // Refetch data when modal closes
          queryClient.invalidateQueries({
            queryKey: ['student-module-details', courseId, moduleId],
            exact: true
          });
        }}
        url={currentLesson?.url}
        title={currentLesson?.title}
      />
    </div>
  );
};

// Module item component
const ModuleItem = ({ module, courseId, index }) => {
  const isLocked = module.isLocked;
  const isCompleted = module.isCompleted;

  // Use the actual progress percentage from the backend
  const progressPercentage = module.progressPercentage || 0;

  return (
    <div className={`relative rounded-lg border-2 shadow-lg bg-card hover:shadow-xl transition-all duration-200 w-full overflow-clip`}>
      <AccordionItem
        value={module.id}
        className="border-0"
        disabled={isLocked}
      >
      <AccordionTrigger
        className={`group py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-6 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-accent/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]]:border-b [&[data-state=open]]:border-border w-full overflow-visible hover:no-underline relative [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-3 sm:[&>svg]:right-4 sm:[&>svg]:top-1/2 sm:[&>svg]:-translate-y-1/2 [&>svg]:h-5 [&>svg]:w-5 ${
          isLocked ? 'cursor-not-allowed opacity-60' : ''
        }`}
        disabled={isLocked}
      >
        <div className="flex items-center gap-3 text-left flex-1 w-full pr-8 sm:pr-0">
          <div className={`flex-shrink-0 rounded-lg p-2 ${
            isLocked
              ? 'bg-muted'
              : isCompleted
              ? 'bg-green-100'
              : 'bg-primary/10'
          }`}>
            {isLocked ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : isCompleted ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <BookOpen className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-semibold text-sm md:text-base truncate max-w-[200px] sm:max-w-none ${
                isLocked ? '' : ''
              }`}>
                Module {index + 1}: {module.title}
              </span>
              {isCompleted && (
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              )}
            </div>

            {isLocked && (
              <p className="text-xs text-orange-600 mt-1 font-medium">
                Complete the previous module to unlock
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar - Below on mobile, right on sm+ */}
        <div className="w-full sm:w-auto flex-shrink-0 flex flex-col items-start sm:items-end gap-1 sm:pr-8">
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-medium ${
              isLocked
                ? 'text-muted-foreground'
                : isCompleted
                ? 'text-green-600'
                : 'text-primary'
            }`}>
              {progressPercentage}%
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={`h-2 w-full sm:w-20 md:w-32 lg:w-40 ${
              isLocked
                ? '[&>div]:bg-muted-foreground/30'
                : isCompleted
                ? '[&>div]:bg-green-500'
                : '[&>div]:bg-primary'
            }`}
          />
        </div>
      </AccordionTrigger>
      {!isLocked && (
        <AccordionContent className="px-4 py-3 md:py-4 border-t">
          <ModuleContentDisplay
            courseId={courseId}
            moduleId={module.id}
          />
        </AccordionContent>
      )}
    </AccordionItem>
    </div>
  );
};

// Main component
const ModuleAccordion = ({ courseId }) => {
  const { data: modules = [], isLoading, error, refetch } = useModulesForStudent(courseId);
  const { data: courseProgress } = useStudentCourseProgress(courseId);

  // Ensure modules is always an array
  const safeModules = Array.isArray(modules) ? modules : [];

  if (isLoading) {
    return <ModulesSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (safeModules.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="-mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-4 md:py-6">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {safeModules.map((module, index) => (
          <ModuleItem
            key={module.id}
            module={module}
            courseId={courseId}
            index={index}
            courseProgress={courseProgress}
          />
        ))}
      </Accordion>
      <div className="h-4" />
    </div>
  );
};

export default ModuleAccordion;

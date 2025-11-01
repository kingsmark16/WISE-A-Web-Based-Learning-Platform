import { Award, Lock, Download, ExternalLink, Loader, FileCheck, CheckCircle2, Zap, Shield, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCourseCompletion } from "@/hooks/student/useCourseCompletion";
import { useCourseProgress } from "@/hooks/student/useCourseProgress";
import { useCompleteCourse } from "@/hooks/student/useCompleteCourse";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

// Helper function to format date without date-fns
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Dynamic messages based on progress percentage
const getMotivationalMessage = (percentage) => {
  if (percentage >= 90) return "You're so close! 🔥";
  if (percentage >= 75) return "Keep pushing! 💪";
  if (percentage >= 50) return "Halfway there! 🚀";
  if (percentage >= 25) return "Great start! 🌟";
  return "Let's get started! 👊";
};

const getMotivationalSubMessage = (percentage) => {
  if (percentage >= 90) return "Just a little bit more to go!";
  if (percentage >= 75) return "You're in the home stretch!";
  if (percentage >= 50) return "Keep up this momentum!";
  if (percentage >= 25) return "Solid progress, keep going!";
  return "Every step counts!";
};

const CertificationTab = ({ courseId, courseTitle }) => {
  const { data: completion, isLoading: isLoadingCompletion, refetch: refetchCompletion } = useCourseCompletion(courseId);
  const { data: progress, isLoading: isLoadingProgress } = useCourseProgress(courseId);
  const { mutate: completeCourse, isPending: isGenerating } = useCompleteCourse();
  const pollingRef = useRef(null);
  const generationAttemptRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(true);

  const completionPercentage = progress?.progressPercentage || 0;
  const isFullyCompleted = completionPercentage >= 100;

  // Handle certificate download
  const handleDownloadCertificate = async (certificateUrl, certificateNumber) => {
    try {
      setIsDownloading(true);
      const response = await fetch(certificateUrl);
      const blob = await response.blob();
      
      // Create blob URL and download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `certificate-${certificateNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Poll for certificate generation if it's being generated
  useEffect(() => {
    const isAttemptingGeneration = generationAttemptRef.current !== null;
    if ((!isGenerating && !isAttemptingGeneration) || !isFullyCompleted) return;

    let attemptCount = 0;
    const maxAttempts = 60; // Max 60 seconds of polling

    // Start with aggressive polling (1 second), then back off to 2 seconds after 5 seconds
    const poll = () => {
      attemptCount++;
      refetchCompletion();
      
      if (attemptCount >= maxAttempts) {
        // Stop polling after max attempts
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return;
      }

      // After first 5 attempts (5 seconds), back off to 2 second intervals
      const nextInterval = attemptCount >= 5 ? 2000 : 1000;
      pollingRef.current = setTimeout(poll, nextInterval);
    };

    // Start first poll immediately
    poll();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isGenerating, isFullyCompleted, refetchCompletion]);

  // Stop showing generating state if certificate is found
  useEffect(() => {
    if (completion?.certificate) {
      generationAttemptRef.current = null;
      setIsPdfLoading(true); // Reset PDF loading state for new certificate
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [completion?.certificate]);

  // Clear generation ref if progress goes below 100% (new content added)
  useEffect(() => {
    if (completionPercentage < 100 && generationAttemptRef.current !== null) {
      generationAttemptRef.current = null;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [completionPercentage]);

  const handleGenerateCertificate = () => {
    generationAttemptRef.current = Date.now();
    completeCourse(courseId, {
      onSuccess: () => {
        toast.success('Certificate generation started! It will be ready shortly.', {
          duration: 5000,
        });
        // Refetch immediately after successful generation call
        // This ensures we get the certificate quickly
        setTimeout(() => {
          refetchCompletion();
        }, 500);
      },
      onError: (error) => {
        generationAttemptRef.current = null;
        toast.error(error?.response?.data?.message || 'Failed to start certificate generation');
      }
    });
  };

  const isLoading = isLoadingCompletion || isLoadingProgress;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading certification details...</p>
        </div>
      </div>
    );
  }

  // Course not fully completed (< 100%) - show locked state
  if (!isFullyCompleted) {
    const lessonsNeeded = Math.ceil((100 - completionPercentage));
    
    return (
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Main Progress Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardContent className="pt-0 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side - Visual */}
              <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-200 dark:bg-yellow-900/30 rounded-full blur-2xl opacity-50"></div>
                  <div className="relative p-4 sm:p-5 md:p-6 rounded-full bg-yellow-100 dark:bg-yellow-900/40 border-2 border-yellow-300 dark:border-yellow-700">
                    <Lock className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="text-center space-y-1 sm:space-y-2">
                  <h3 className="text-lg sm:text-2xl md:text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {getMotivationalMessage(completionPercentage)}
                  </h3>
                  <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                    {getMotivationalSubMessage(completionPercentage)}
                  </p>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                {/* Progress Section */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs sm:text-sm">Course Progress</span>
                      <span className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {Math.round(completionPercentage)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(completionPercentage, 100)} 
                      className="h-2 sm:h-3"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lessonsNeeded}% to go until certification unlock
                  </p>
                </div>

                {/* Checklist */}
                <div className="space-y-2 bg-muted/50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-semibold">Completion Requirements:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <CheckCircle2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">Complete all lessons</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <CheckCircle2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">Pass all module quizzes</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-3.5 sm:h-4 w-3.5 sm:w-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm text-muted-foreground">Reach 100% completion</span>
                    </div>
                  </div>
                </div>

                {/* Motivation */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs sm:text-sm text-yellow-900 dark:text-yellow-100">
                    <Zap className="h-3.5 sm:h-4 w-3.5 sm:w-4 inline mr-1.5 sm:mr-2" />
                    <span className="font-semibold">Keep up the momentum!</span> You're doing great.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    );
  }

  // Course fully completed (100%) - show certificate or unlock message
  if (isFullyCompleted && completion) {
    // Has certificate - show it
    const { certificate, completedAt } = completion;
    const formattedDate = completedAt 
      ? formatDate(completedAt)
      : formatDate(new Date());

    return (
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Success Banner */}
        <div className="relative overflow-hidden rounded-lg">
          <Card className="border-0 relative">
            <CardContent className="pt-6 pb-6 sm:pt-8 sm:pb-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                  <CheckCircle2 className="h-6 sm:h-8 w-6 sm:w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
                    🎉 Congratulations!
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    You have successfully completed <span className="font-semibold text-foreground">{courseTitle}</span>. Your certificate is ready!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificate Card */}
        {certificate && (
          <Card className="overflow-hidden shadow-lg border-0">
            <CardHeader className="border-b p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Award className="h-4 sm:h-5 w-4 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <CardTitle className="text-base sm:text-lg truncate">Your Certificate</CardTitle>
                </div>
                <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm flex-shrink-0">Verified</Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 pb-6 sm:pt-8 sm:pb-8 px-4 sm:px-6 md:px-8">
              <div className="space-y-4 sm:space-y-6">
                {/* Mobile Download Button - Visible only on mobile */}
                {certificate.certificateUrl && (
                  <div className="md:hidden flex justify-center">
                    <Button 
                      onClick={() => handleDownloadCertificate(certificate.certificateUrl, certificate.certificateNumber)}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-shadow w-full justify-center"
                      size="lg"
                    >
                      {isDownloading ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5" />
                          Download Certificate
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Certificate PDF Preview - Hidden on Mobile */}
                {certificate.certificateUrl && (
                  <div className="hidden md:block w-full bg-gray-100 dark:bg-slate-800 rounded-lg border-2 border-muted overflow-hidden relative">
                    {isPdfLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-slate-800 z-10">
                        <div className="flex flex-col items-center gap-3">
                          <Loader className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Loading certificate preview...</p>
                        </div>
                      </div>
                    )}
                    <embed 
                      src={certificate.certificateUrl}
                      type="application/pdf"
                      className="w-full"
                      style={{ height: '600px' }}
                      onLoad={() => setIsPdfLoading(false)}
                      onError={() => setIsPdfLoading(false)}
                    />
                  </div>
                )}

                {/* Certificate Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Course</p>
                    <p className="text-sm sm:text-base font-semibold line-clamp-2">{courseTitle}</p>
                  </div>

                  <div className="space-y-1 sm:space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time Spent</p>
                    <p className="text-sm sm:text-base font-semibold">
                      {completion?.timeSpent?.display || '0s'}
                    </p>
                  </div>

                  <div className="space-y-1 sm:space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Completion Date</p>
                    <p className="text-sm sm:text-base font-semibold">{formattedDate}</p>
                  </div>

                  <div className="space-y-1 sm:space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Certificate #</p>
                    <p className="text-xs sm:text-sm font-mono font-semibold break-all text-primary">{certificate.certificateNumber}</p>
                  </div>

                  <div className="space-y-1 sm:space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Issue Date</p>
                    <p className="text-sm sm:text-base font-semibold">{formatDate(certificate.issueDate)}</p>
                  </div>

                  <div className="space-y-1 sm:space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Enrolled Date</p>
                    <p className="text-sm sm:text-base font-semibold">{completion?.enrolledAt ? formatDate(completion.enrolledAt) : 'N/A'}</p>
                  </div>
                </div>

                {/* Actions - Download Button for Desktop */}
                <div className="hidden md:flex justify-center pt-2 sm:pt-4">
                  {certificate.certificateUrl && (
                    <Button 
                      onClick={() => handleDownloadCertificate(certificate.certificateUrl, certificate.certificateNumber)}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-6 sm:px-8 py-5 sm:py-6 rounded-lg font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-shadow"
                      size="lg"
                    >
                      {isDownloading ? (
                        <>
                          <Loader className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 sm:h-5 w-4 sm:w-5" />
                          Download Certificate
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Verify Info */}
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    <Shield className="h-3.5 sm:h-4 w-3.5 sm:w-4 inline mr-1.5 sm:mr-2" />
                    <span className="font-semibold">Verify Certificate:</span> Share the certificate number <span className="font-mono font-semibold break-all">{certificate.certificateNumber}</span> for verification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    );
  }

  // Course 100% completed but no certificate yet - show unlock message with generate button
  const isCertificateGenerating = isGenerating || (generationAttemptRef.current !== null && !completion?.certificate);

  return (
    <div className="w-full">
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="pt-0 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Visual */}
            <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 min-h-64 sm:min-h-80 md:min-h-96">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-50 ${isCertificateGenerating ? 'animate-pulse bg-blue-200 dark:bg-blue-900/30' : 'animate-pulse bg-green-200 dark:bg-green-900/30'}`}></div>
                <div className="relative p-4 sm:p-5 md:p-6 rounded-full bg-green-100 dark:bg-green-900/40 border-2 border-green-300 dark:border-green-700">
                  {isCertificateGenerating ? (
                    <Loader className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : (
                    <Award className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-green-600 dark:text-green-400" />
                  )}
                </div>
              </div>
              <div className="text-center space-y-1 sm:space-y-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">
                  {isCertificateGenerating ? '✨ Generating...' : '🎉 Amazing!'}
                </h3>
                <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                  {isCertificateGenerating ? 'Your certificate is being created' : "You've completed 100%"}
                </p>
              </div>
            </div>

            {/* Right Side - Generate or Generating Status */}
            <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 md:space-y-6 flex flex-col justify-center">
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                  {isCertificateGenerating ? 'Certificate Being Generated' : 'Ready for Your Certificate?'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isCertificateGenerating 
                    ? 'Your certificate is being prepared in the background. You can leave this page and come back later—it will be ready shortly.'
                    : `Click below to generate and download your official certificate of completion for ${courseTitle}.`
                  }
                </p>
              </div>

              {/* Generation Status */}
              {isCertificateGenerating && (
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 dark:text-blue-400 animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100">Generation in Progress</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature List */}
              {!isCertificateGenerating && (
                <div className="space-y-2 bg-muted/50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Verified certificate with QR code</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Unique certificate number</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Downloadable PDF format</span>
                  </div>
                </div>
              )}

              {/* Generate Button or Wait Message */}
              {isCertificateGenerating ? (
                <div className="text-center py-2 sm:py-3">
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 text-xs sm:text-sm font-semibold">
                    <Loader className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                    <span>Generating your certificate...</span>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleGenerateCertificate}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 px-6 sm:px-8 py-5 sm:py-6 rounded-lg font-semibold text-sm sm:text-base"
                  size="lg"
                >
                  <Award className="h-4 sm:h-5 w-4 sm:w-5" />
                  Generate My Certificate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificationTab;

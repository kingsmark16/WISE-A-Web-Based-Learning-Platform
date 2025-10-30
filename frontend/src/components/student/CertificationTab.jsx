import { Award, Lock, Download, ExternalLink, Loader, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCourseCompletion } from "@/hooks/student/useCourseCompletion";
import { useCourseProgress } from "@/hooks/student/useCourseProgress";
import { useCompleteCourse } from "@/hooks/student/useCompleteCourse";
import toast from "react-hot-toast";

// Helper function to format date without date-fns
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const CertificationTab = ({ courseId, courseTitle }) => {
  const { data: completion, isLoading: isLoadingCompletion } = useCourseCompletion(courseId);
  const { data: progress, isLoading: isLoadingProgress } = useCourseProgress(courseId);
  const { mutate: completeCourse, isPending: isGenerating } = useCompleteCourse();

  const completionPercentage = progress?.progressPercentage || 0;
  const isFullyCompleted = completionPercentage >= 100;

  const handleGenerateCertificate = () => {
    completeCourse(courseId, {
      onSuccess: () => {
        toast.success('Certificate generated successfully! 🎉');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to generate certificate');
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
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-2 border-dashed border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center text-center gap-6">
              {/* Lock Icon */}
              <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Lock className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  Certification Locked
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                  Complete the course 100% to unlock your certificate
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    Course Progress
                  </span>
                  <span className="text-sm font-bold text-yellow-900 dark:text-yellow-100">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-yellow-200 dark:bg-yellow-900/40 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-yellow-500 dark:bg-yellow-400 h-full transition-all duration-300"
                    style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-yellow-600 dark:text-yellow-400 max-w-md">
                To earn your certificate of completion for <span className="font-semibold">{courseTitle}</span>, 
                you need to complete all modules and pass the required quizzes in this course.
              </p>

              {/* Progress Indicator */}
              <div className="w-full bg-yellow-200 dark:bg-yellow-900/30 rounded-lg p-4 text-left">
                <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  What you need to do:
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>✓ Complete all lessons in each module</li>
                  <li>✓ Pass all module quizzes</li>
                  <li>✓ Achieve 100% completion</li>
                </ul>
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
      <div className="w-full max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Success Header */}
          <Card className="border-2 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-1">
                    Congratulations! 🎉
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    You have successfully completed the course <span className="font-semibold">{courseTitle}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Card */}
          {certificate && (
            <Card className="overflow-hidden shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <CardTitle className="text-lg">Your Certificate</CardTitle>
                  </div>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    Verified
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-8 pb-8">
                <div className="space-y-6">
                  {/* Certificate Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Course Name */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Course
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {courseTitle}
                      </p>
                    </div>

                    {/* Completion Date */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Completed On
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {formattedDate}
                      </p>
                    </div>

                    {/* Certificate Number */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Certificate Number
                      </p>
                      <p className="text-lg font-mono font-semibold text-foreground break-all">
                        {certificate.certificateNumber}
                      </p>
                    </div>

                    {/* Issue Date */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Issue Date
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatDate(certificate.issueDate)}
                      </p>
                    </div>
                  </div>

                  {/* Certificate Preview Note */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      📄 Your certificate has been generated and is ready for download.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {certificate.certificateUrl && (
                      <>
                        <Button 
                          onClick={() => window.open(certificate.certificateUrl, '_blank')}
                          className="flex items-center gap-2 flex-1"
                          size="lg"
                        >
                          <Download className="h-4 w-4" />
                          Download Certificate
                        </Button>

                        <Button 
                          onClick={() => window.open(certificate.certificateUrl, '_blank')}
                          variant="outline"
                          className="flex items-center gap-2 flex-1"
                          size="lg"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Certificate
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Share/Verify Info */}
                  <div className="p-4 bg-muted/50 rounded-lg text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-semibold">Share your achievement:</span> Others can verify your certificate 
                      using the certificate number {certificate.certificateNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Certificate Information</h4>
                <p className="text-sm text-muted-foreground">
                  This certificate validates your successful completion of all course requirements including 
                  lessons, modules, and assessments. Keep this certificate for your records and share it with 
                  employers, educational institutions, or on professional networks.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Course 100% completed but no certificate yet - show unlock message with generate button
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center text-center gap-6">
            {/* Success Icon */}
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
              <Award className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                Course Completed! 🎉
              </h3>
              <p className="text-green-700 dark:text-green-300 font-medium">
                You've achieved 100% completion
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-green-600 dark:text-green-400 max-w-md">
              Congratulations on completing <span className="font-semibold">{courseTitle}</span>! 
              Generate your certificate to get official recognition of your achievement.
            </p>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateCertificate}
              disabled={isGenerating}
              size="lg"
              className="mt-2 bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Generating Certificate...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Generate Certificate
                </>
              )}
            </Button>

            {/* Info Box */}
            <div className="w-full bg-green-200 dark:bg-green-900/30 rounded-lg p-4 text-left">
              <p className="text-xs font-semibold text-green-900 dark:text-green-100 mb-2">
                Your certificate will include:
              </p>
              <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                <li>✓ Your name and course title</li>
                <li>✓ Unique certificate number</li>
                <li>✓ Issue date and QR code</li>
                <li>✓ Downloadable PDF format</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificationTab;

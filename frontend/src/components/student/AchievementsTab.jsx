import { useStudentCertificates } from '@/hooks/student/useStudentCertificates';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, AlertCircle, Download, Calendar, Hash } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { useState, useCallback } from 'react';

const AchievementsTab = () => {
  const { data: certificates = [], isLoading, error } = useStudentCertificates();
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadCertificate = useCallback(async (certificateUrl, certificateNumber) => {
    try {
      setDownloadingId(certificateNumber);
      const response = await fetch(certificateUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch certificate');
      }

      const blob = await response.blob();

      // Create blob URL and download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `certificate-${certificateNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* Thumbnail skeleton */}
            <Skeleton className="aspect-[16/11] w-full" />
            {/* Content skeleton */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {/* Title */}
              <Skeleton className="h-5 sm:h-6 w-3/4" />
              {/* College badge */}
              <Skeleton className="h-5 w-24 sm:w-28 rounded-full" />
              {/* Certificate details */}
              <div className="pt-2 sm:pt-3 border-t space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 sm:h-4 w-16" />
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 sm:h-4 w-12" />
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                </div>
              </div>
              {/* Download button */}
              <Skeleton className="h-9 sm:h-10 w-full mt-3 sm:mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load certificates. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
          <Award className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-xl font-semibold text-foreground mb-2">No certificates yet</p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Complete courses to earn certificates and display your achievements here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {certificates.map((cert) => (
        <div 
          key={cert.id} 
          className="group flex flex-col h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
        >
          {/* Certificate PDF Preview Section */}
          <div className="relative aspect-[16/11] w-full overflow-hidden bg-white dark:bg-slate-900">
            {/* PDF Embed as Thumbnail */}
            <iframe
              src={`${cert.certificateUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=Fit`}
              className="absolute inset-0 w-full h-full border-0 pointer-events-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              title={`Certificate for ${cert.courseTitle}`}
              scrolling="no"
            />
            
            {/* Fallback if PDF doesn't load */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 -z-10">
              <Award className="h-12 w-12 sm:h-16 sm:w-16 text-amber-500/50" />
            </div>
            
            {/* Overlay Gradient on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
          </div>

          {/* Content Section */}
          <div className="flex flex-1 flex-col p-3 sm:p-4">
            
            {/* Course Title */}
            <h3 
              className="mb-1 font-semibold text-base sm:text-lg leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors" 
              title={cert.courseTitle}
            >
              {cert.courseTitle}
            </h3>

            {/* College Badge */}
            {cert.college && (
              <div className="mb-2 sm:mb-3">
                <Badge 
                  variant="secondary" 
                  className="max-w-full justify-start font-medium text-[10px] sm:text-xs bg-secondary/50 hover:bg-secondary/70 transition-colors"
                  title={cert.college}
                >
                  <span className="truncate">
                    {cert.college}
                  </span>
                </Badge>
              </div>
            )}

            {/* Certificate Details */}
            <div className="mt-auto space-y-1.5 sm:space-y-2 pt-2 sm:pt-3 border-t">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
                  <Hash className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Certificate
                </span>
                <span className="font-mono font-semibold text-foreground text-[9px] sm:text-xs truncate max-w-[120px] sm:max-w-none">
                  {cert.certificateNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Issued
                </span>
                <span className="font-medium text-foreground">
                  {formatDate(cert.issuedAt)}
                </span>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={() => handleDownloadCertificate(cert.certificateUrl, cert.certificateNumber)}
              disabled={downloadingId === cert.certificateNumber}
              className="w-full mt-3 sm:mt-4 h-9 sm:h-10 text-xs sm:text-sm"
              size="sm"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              {downloadingId === cert.certificateNumber ? 'Downloading...' : 'Download Certificate'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementsTab;

import { useStudentCertificates } from '@/hooks/student/useStudentCertificates';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, AlertCircle, Download, User, Calendar, Hash } from 'lucide-react';
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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 sm:gap-5 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-20" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-9 w-full" />
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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 sm:gap-5 lg:gap-6">
      {certificates.map((cert) => (
        <div 
          key={cert.id} 
          className="group flex flex-col h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
        >
          {/* Certificate Preview Section */}
          <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
            <object
              data={`${cert.certificateUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
              type="application/pdf"
              className="w-full h-full pointer-events-none"
            >
              <div className="flex h-full w-full items-center justify-center">
                <Award className="h-12 w-12 text-amber-500/50" />
              </div>
            </object>
            
            {/* Overlay Gradient on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Completed Badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-600 hover:bg-green-600 text-white shadow-md">
                <Award className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-1 flex-col p-4">
            
            {/* Course Title */}
            <h3 
              className="mb-1 font-semibold text-lg leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors" 
              title={cert.courseTitle}
            >
              {cert.courseTitle}
            </h3>

            {/* College Badge */}
            {cert.college && (
              <div className="mb-3">
                <Badge 
                  variant="secondary" 
                  className="max-w-full justify-start font-medium text-xs bg-secondary/50 hover:bg-secondary/70 transition-colors"
                  title={cert.college}
                >
                  <span className="truncate">
                    {cert.college}
                  </span>
                </Badge>
              </div>
            )}

            {/* Instructor Info */}
            {cert.instructor && (
              <div className="mb-4 flex items-center gap-3">
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                  {cert.instructorImage ? (
                    <img src={cert.instructorImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate text-foreground/90">
                    {cert.instructor}
                  </span>
                  <span className="text-xs text-muted-foreground">Instructor</span>
                </div>
              </div>
            )}

            {/* Certificate Details */}
            <div className="mt-auto space-y-2 pt-3 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  Certificate
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {cert.certificateNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
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
              className="w-full mt-4"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloadingId === cert.certificateNumber ? 'Downloading...' : 'Download Certificate'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementsTab;

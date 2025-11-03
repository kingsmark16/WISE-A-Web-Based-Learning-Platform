import { useStudentCertificates } from '@/hooks/student/useStudentCertificates';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, AlertCircle, Download } from 'lucide-react';
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-muted" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load certificates. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-muted mb-4">
          <Award className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground mb-1">No certificates yet</p>
        <p className="text-sm text-muted-foreground">
          Complete courses to earn certificates and display your achievements here
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert) => (
          <Card key={cert.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col p-0">
            {/* Certificate PDF Preview */}
            <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
              <object
                data={`${cert.certificateUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
                type="application/pdf"
                className="w-full h-full"
                style={{ overflow: 'hidden', transform: 'scale(1)', transformOrigin: 'top left' }}
              >
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                  <span className="text-4xl text-slate-400">🏆</span>
                </div>
              </object>
            </div>

            <CardContent className="p-2 space-y-2">
              {/* Course Title */}
              <div className="text-center">
                <p className="font-semibold text-primary line-clamp-2 text-sm md:text-base">
                  {cert.courseTitle}
                </p>
              </div>

              {/* College */}
              {cert.college && (
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-xs">
                    {cert.college}
                  </Badge>
                </div>
              )}

              {/* Instructor */}

              {/* Certificate Details */}
              <div className="space-y-2 text-xs border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cert #:</span>
                  <span className="font-mono font-semibold text-foreground">{cert.certificateNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Issued:</span>
                  <span className="text-foreground">{formatDate(cert.issuedAt)}</span>
                </div>
              </div>

              {/* Download Button */}
              <Button
                onClick={() => handleDownloadCertificate(cert.certificateUrl, cert.certificateNumber)}
                disabled={downloadingId === cert.certificateNumber}
                className="w-full mt-3 bg-primary hover:bg-primary/90 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadingId === cert.certificateNumber ? 'Downloading...' : 'Download'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AchievementsTab;

// pages/VerifyCertificate.jsx
// A complete, ready-to-use certificate verification page

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, Shield, Search, ArrowLeft, GraduationCap, Calendar, User, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import axiosInstance from '@/lib/axios';

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoVerified, setAutoVerified] = useState(false);

  // Auto-verify if code in URL query params
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && !autoVerified) {
      setCode(urlCode);
      handleVerifyDirect(urlCode);
      setAutoVerified(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoVerified]);

  const handleVerifyDirect = async (certificateCode) => {
    if (!certificateCode.trim()) {
      setError('Please enter a certificate number');
      setCert(null);
      return;
    }

    setLoading(true);
    setError(null);
    setCert(null);

    try {
      const response = await axiosInstance.get('/certificate/verify', {
        params: { code: certificateCode.trim() }
      });

      if (response.data) {
        setCert(response.data);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Certificate not found. Please check the certificate number and try again.');
      } else if (err.response?.status === 400) {
        setError('Invalid certificate number format.');
      } else {
        setError(err.response?.data?.message || 'Failed to verify certificate');
      }
      setCert(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerifyDirect(code);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
      
      <div className="relative z-10 px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/25 mb-4 sm:mb-6">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3">
              Verify Certificate
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
              Enter a certificate number to verify its authenticity
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-6 sm:mb-8 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter certificate number (e.g., WISE-2025-XXXX-XXXX)"
                    className="pl-12 h-12 sm:h-14 text-base sm:text-lg rounded-xl border-2 focus:border-primary transition-colors"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Verify Certificate
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="mb-6 sm:mb-8 border-destructive/50 bg-destructive/5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-destructive text-base sm:text-lg">Verification Failed</h3>
                    <p className="text-destructive/80 text-sm sm:text-base mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="mb-6 sm:mb-8 shadow-lg">
              <CardContent className="py-12 sm:py-16">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  </div>
                  <p className="text-muted-foreground text-base sm:text-lg">Verifying certificate...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificate Details */}
          {cert && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Success Banner */}
              <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl shadow-green-500/25">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold">Certificate Verified</h3>
                      <p className="text-white/80 text-sm sm:text-base">This certificate is valid and authentic</p>
                    </div>
                    <Badge className="bg-white/20 text-white border-0 text-xs sm:text-sm px-3 py-1 hidden sm:flex">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Certificate Details Card */}
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                {/* Certificate Header with Decorative Border */}
                <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 dark:from-primary/20 dark:via-primary/10 dark:to-primary/20 p-6 sm:p-8 border-b">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
                  <div className="flex items-center justify-center gap-3">
                    <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">Certificate of Completion</h2>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-6 md:p-8">
                  {/* Student & Course Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Student */}
                    <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Recipient</span>
                      </div>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                        {cert.student}
                      </p>
                    </div>

                    {/* Course */}
                    <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Course</span>
                      </div>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground line-clamp-2">
                        {cert.course}
                      </p>
                    </div>
                  </div>

                  {/* Certificate Number & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Certificate Number */}
                    <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Certificate ID</span>
                      </div>
                      <p className="text-sm sm:text-base font-mono font-bold text-foreground break-all">
                        {cert.certificateNumber}
                      </p>
                    </div>

                    {/* Issue Date */}
                    <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Issue Date</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {formatDate(cert.issueDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Welcome Message (when no result) */}
          {!cert && !loading && !error && (
            <Card className="text-center shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="py-12 sm:py-16 px-4 sm:px-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 mb-2">
                    <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                      Welcome to Certificate Verification
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                      Enter a certificate number above to verify an achievement. Each certificate is uniquely numbered and can be verified publicly.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2">
                    <Badge variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                      Secure Verification
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                      Instant Results
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm">
                      <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                      Public Access
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Certificate verification is public and available to anyone.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Powered by{' '}
              <Link to="/" className="text-primary font-medium hover:underline">
                WISE Learning Platform
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

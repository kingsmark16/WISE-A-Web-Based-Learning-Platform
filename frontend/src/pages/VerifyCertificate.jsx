// pages/VerifyCertificate.jsx
// A complete, ready-to-use certificate verification page

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Certificate
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter a certificate number or scan a QR code to verify
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle>Certificate Number</CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter Certificate Number
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g., WISE-2025-ABCD-EFGH-IJ"
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-6"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: You can also scan the QR code on your certificate to auto-fill this field
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Verification Failed</h3>
                  <p className="text-red-800 dark:text-red-200 text-sm mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-600 dark:text-gray-300">Verifying certificate...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificate Details */}
        {cert && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Success Header */}
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                      Certificate Verified ✓
                    </h3>
                    <p className="text-green-800 dark:text-green-200 text-sm mt-1">
                      This certificate is valid and authentic
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Details Card */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b">
                <CardTitle className="text-2xl">Certificate Details</CardTitle>
              </CardHeader>

              <CardContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Student Name */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Student
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cert.student}
                    </p>
                  </div>

                  {/* Course */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Course
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cert.course}
                    </p>
                  </div>

                  {/* Certificate Number */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Certificate Number
                    </p>
                    <p className="text-lg font-mono font-bold text-gray-900 dark:text-white break-all">
                      {cert.certificateNumber}
                    </p>
                  </div>

                  {/* Issue Date */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Issue Date
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatDate(cert.issueDate)}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t dark:border-gray-700 my-8"></div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {cert.url && (
                    <>
                      <Button
                        onClick={() => window.open(cert.url, '_blank')}
                        className="flex-1 flex items-center justify-center gap-2"
                        size="lg"
                      >
                        <Download className="h-4 w-4" />
                        Download Certificate
                      </Button>

                      <Button
                        onClick={() => window.open(cert.url, '_blank')}
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-2"
                        size="lg"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View PDF
                      </Button>
                    </>
                  )}
                </div>

                {/* Info Box */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <span className="font-semibold">Share this certificate:</span> You can share the certificate number{' '}
                    <span className="font-mono text-xs bg-white dark:bg-gray-800 px-1 py-0.5 rounded">
                      {cert.certificateNumber}
                    </span>{' '}
                    with anyone to let them verify it using this tool.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Share Section */}
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-4">
                  Share Your Achievement
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    📝 Copy the certificate number to share:
                  </p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-purple-100 dark:bg-purple-900 p-3 rounded font-mono text-sm text-purple-900 dark:text-purple-100">
                      {cert.certificateNumber}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(cert.certificateNumber);
                        alert('Certificate number copied!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Welcome Message (when no result) */}
        {!cert && !loading && !error && (
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <div className="space-y-4">
                <div className="text-4xl">🎓</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to Certificate Verification
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  Enter a certificate number above to verify an achievement. Each certificate is uniquely numbered
                  and can be verified publicly.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Certificate verification is public and available to anyone.{' '}
            <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Back to home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

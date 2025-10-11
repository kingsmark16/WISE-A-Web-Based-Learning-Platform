import React, { useEffect } from "react";

const PdfViewer = ({ open, onClose, pdfUrl }) => {
  // Open PDF directly in new tab for both desktop and mobile
  useEffect(() => {
    if (open && pdfUrl) {
      // Fix localhost URLs for mobile access
      let cleanUrl = pdfUrl.split('#')[0];
      
      // If URL contains localhost, replace it with current window location hostname
      if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
        const currentHost = window.location.hostname;
        cleanUrl = cleanUrl.replace(/localhost|127\.0\.0\.1/g, currentHost);
      }
      
      window.open(cleanUrl, '_blank');
      // Close the modal immediately
      onClose();
    }
  }, [open, pdfUrl, onClose]);

  // Don't render anything since we're opening in new tab
  return null;
};

export default PdfViewer;
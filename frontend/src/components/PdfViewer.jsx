import React, { useState, useEffect } from "react";

const PdfViewer = ({ open, onClose, pdfUrl, title }) => {
  const [loading, setLoading] = useState(true);

  // Reset loading when pdfUrl changes or when opened
  useEffect(() => {
    if (open && pdfUrl) setLoading(true);
  }, [pdfUrl, open]);

  // Add a small delay to show the spinner even for fast loads
  const handleLoad = () => {
    setTimeout(() => setLoading(false), 300);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 2000,
        width: "100vw",
        height: "100vh",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#111",
          position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 30,
            fontSize: 32,
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            cursor: "pointer",
            zIndex: 10,
          }}
          aria-label="Close PDF"
        >
          &times;
        </button>
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.2)",
              zIndex: 5,
            }}
          >
            <div style={{
              border: "6px solid #f3f3f3",
              borderTop: "6px solid #3498db",
              borderRadius: "50%",
              width: 60,
              height: 60,
              animation: "spin 1s linear infinite"
            }} />
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}
        <iframe
          src={pdfUrl}
          title={title}
          style={{
            width: "100vw",
            height: "100vh",
            border: "none",
            display: "block",
          }}
          onLoad={handleLoad}
        />
      </div>
    </div>
  );
};

export default PdfViewer;
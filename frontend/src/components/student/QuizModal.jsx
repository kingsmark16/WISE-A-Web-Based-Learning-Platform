import React, { useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';

// Utility function to join classNames
const cn = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Custom Modal Component (No Shadcn)
 * Modern, accessible modal with backdrop and animations
 */
const QuizModal = ({ isOpen, onClose, children, title, showConfetti }) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !showConfetti) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, showConfetti]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={showConfetti ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal Container - Full Screen with Padding */}
      <div className="relative w-full h-full max-w-7xl mx-auto p-2 sm:p-4 flex items-center justify-center animate-in zoom-in-95 duration-300">
        <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Modal Header - Minimal & Clean */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={showConfetti}
              className={cn(
                "flex-shrink-0 p-2 rounded-lg transition-all duration-200 group",
                showConfetti 
                  ? "opacity-0 pointer-events-none" 
                  : "hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              )}
              aria-label="Close quiz"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Modal Content - Scrollable with optimized padding */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;

import { Button } from "@/components/ui/button";
import { Play, Youtube, Upload, Link, FileText, ExternalLink } from "lucide-react";

const UploadActions = ({
  onUploadYoutube,
  onUploadDropbox,
  onUploadPdf,
  onAddLink,
}) => (
  <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
    {/* Video Upload Section */}
    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-red-100 dark:border-red-900/30">
      <h6 className="text-xs sm:text-sm font-semibold text-red-900 dark:text-red-100 mb-2 sm:mb-2.5 md:mb-3 flex items-center gap-1.5 sm:gap-2">
        <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="truncate">Upload Video Lessons</span>
      </h6>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-2.5">
        <Button 
          variant="outline" 
          className="h-8 sm:h-9 md:h-10 px-2 sm:px-3 text-xs sm:text-sm bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 dark:bg-red-950/30 dark:border-red-800/30 dark:text-red-300 dark:hover:bg-red-900/30 transition-all duration-200 min-w-0 flex-shrink-0" 
          onClick={onUploadYoutube}
        >
          <Youtube className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
          <span className="truncate">YouTube</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-8 sm:h-9 md:h-10 px-2 sm:px-3 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:bg-blue-950/30 dark:border-blue-800/30 dark:text-blue-300 dark:hover:bg-blue-900/30 transition-all duration-200 min-w-0 flex-shrink-0" 
          onClick={onUploadDropbox}
        >
          <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
          <span className="truncate">Dropbox</span>
        </Button>
      </div>
    </div>

    {/* PDF Upload Section */}
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-orange-100 dark:border-orange-900/30">
      <h6 className="text-xs sm:text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2 sm:mb-2.5 md:mb-3 flex items-center gap-1.5 sm:gap-2">
        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="truncate">Upload PDF Lessons</span>
      </h6>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-2.5">
        <Button 
          variant="outline" 
          className="h-8 sm:h-9 md:h-10 px-2 sm:px-3 text-xs sm:text-sm bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:text-orange-800 dark:bg-orange-950/30 dark:border-orange-800/30 dark:text-orange-300 dark:hover:bg-orange-900/30 transition-all duration-200 min-w-0 flex-shrink-0" 
          onClick={onUploadPdf}
        >
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
          <span className="truncate">Upload PDF</span>
        </Button>
      </div>
    </div>

    {/* Link & Quiz Section - Combined for better space usage on mobile */}
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
      {/* External Link */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-purple-100 dark:border-purple-900/30">
        <h6 className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2 sm:mb-2.5 md:mb-3 flex items-center gap-1.5 sm:gap-2">
          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="truncate">External Link</span>
        </h6>
        <Button
          variant="outline"
          className="h-8 sm:h-9 md:h-10 px-2 sm:px-3 text-xs sm:text-sm bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800 dark:bg-purple-950/30 dark:border-purple-800/30 dark:text-purple-300 dark:hover:bg-purple-900/30 transition-all duration-200 min-w-0 flex-shrink-0"
          onClick={onAddLink}
        >
          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
          <span className="truncate">Add Link</span>
        </Button>
      </div>
    </div>
  </div>
);

export default UploadActions;
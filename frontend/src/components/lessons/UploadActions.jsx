import { Button } from "@/components/ui/button";
import { Play, Youtube, Upload, Link, FileText, ExternalLink, PlusCircle } from "lucide-react";

const UploadActions = ({
  onUploadYoutube,
  onUploadDropbox,
  onPasteLink,
  onUploadPdf,
  onAddLink,
  onCreateQuiz,
}) => (
  <div className="space-y-3 sm:space-y-4">
    {/* Video Upload Section */}
    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-red-100 dark:border-red-900/30">
      <h6 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2 sm:mb-3 flex items-center gap-2">
        <Play className="h-4 w-4" />
        Upload Video Lessons
      </h6>
      <div className="hidden md:flex gap-3">
        <Button variant="outline" className="flex-1 h-10 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:bg-blue-950/30 dark:border-blue-800/30 dark:text-blue-300 dark:hover:bg-blue-900/30 transition-all duration-200" onClick={onUploadDropbox}>
          <Upload className="h-4 w-4 mr-2" />
          Dropbox Video
        </Button>
        <Button variant="outline" className="flex-1 h-10 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 dark:bg-red-950/30 dark:border-red-800/30 dark:text-red-300 dark:hover:bg-red-900/30 transition-all duration-200" onClick={onUploadYoutube}>
          <Youtube className="h-4 w-4 mr-2" />
          YouTube Video
        </Button>
        
       
      </div>
      <div className="md:hidden space-y-2">
        <Button variant="outline" className="w-full h-10 sm:h-11 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 dark:bg-red-950/30 dark:border-red-800/30 dark:text-red-300 dark:hover:bg-red-900/30 transition-all duration-200" onClick={onUploadYoutube}>
          <Youtube className="h-4 w-4 mr-2" />
          <span className="text-sm">YouTube Video</span>
        </Button>
        <Button variant="outline" className="w-full h-10 sm:h-11 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:bg-blue-950/30 dark:border-blue-800/30 dark:text-blue-300 dark:hover:bg-blue-900/30 transition-all duration-200" onClick={onUploadDropbox}>
          <Upload className="h-4 w-4 mr-2" />
          <span className="text-sm">Dropbox Video</span>
        </Button>
        <Button variant="outline" className="w-full h-10 sm:h-11 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 dark:bg-green-950/30 dark:border-green-800/30 dark:text-green-300 dark:hover:bg-green-900/30 transition-all duration-200" onClick={onPasteLink}>
          <Link className="h-4 w-4 mr-2" />
          <span className="text-sm">Paste Video Link</span>
        </Button>
      </div>
    </div>
    {/* PDF Upload Section */}
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-100 dark:border-orange-900/30">
      <h6 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2 sm:mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Upload PDF Lessons
      </h6>
      <Button variant="outline" className="w-full h-10 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:text-orange-800 dark:bg-orange-950/30 dark:border-orange-800/30 dark:text-orange-300 dark:hover:bg-orange-900/30 transition-all duration-200" onClick={onUploadPdf}>
        <FileText className="h-4 w-4 mr-2" />
        <span className="text-sm">Upload PDF Document</span>
      </Button>
    </div>
    {/* Link Section */}
    <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-100 dark:border-purple-900/30">
      <h6 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2 sm:mb-3 flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        Add External Links
      </h6>
      <Button variant="outline" className="w-full h-10 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800 dark:bg-purple-950/30 dark:border-purple-800/30 dark:text-purple-300 dark:hover:bg-purple-900/30 transition-all duration-200" onClick={onAddLink}>
        <ExternalLink className="h-4 w-4 mr-2" />
        <span className="text-sm">Add External Link</span>
      </Button>
    </div>
    {/* Quiz Section */}
    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-teal-100 dark:border-teal-900/30">
      <h6 className="text-sm font-semibold text-teal-900 dark:text-teal-100 mb-2 sm:mb-3 flex items-center gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Quiz Assessment
      </h6>
      <Button variant="outline" className="w-full h-10 bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700 hover:text-teal-800 dark:bg-teal-950/30 dark:border-teal-800/30 dark:text-teal-300 dark:hover:bg-teal-900/30 transition-all duration-200" onClick={onCreateQuiz}>
        <PlusCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">Create Quiz</span>
      </Button>
    </div>
  </div>
);

export default UploadActions;
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, Video, Plus } from "lucide-react";

const UploadActions = ({
  onUploadYoutube,
  onUploadDropbox,
  onUploadPdf,
  onAddLink,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    
    {/* Video Upload Card */}
    <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-50 via-white to-red-50 dark:from-blue-950/30 dark:via-card dark:to-red-950/30 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Video Lesson</h3>
            <p className="text-xs text-muted-foreground">Upload from cloud services</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onUploadDropbox}
            className="w-full h-10 px-4 rounded-xl border-blue-200 bg-white/80 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 dark:bg-blue-950/20 dark:border-blue-800/50 dark:text-blue-400 dark:hover:bg-blue-900/30 text-sm font-medium"
          >
            Server 1 (Dropbox)
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={onUploadYoutube}
            className="w-full h-10 px-4 rounded-xl border-red-200 bg-white/80 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 dark:bg-red-950/20 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/30 text-sm font-medium"
          >
            Server 2 (Youtube Unlisted)
          </Button>
        </div>
      </div>
    </div>

    {/* PDF Upload Card */}
    <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-orange-950/30 dark:via-card dark:to-amber-950/30 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">PDF Lesson</h3>
            <p className="text-xs text-muted-foreground">Upload document files</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onUploadPdf}
          className="w-full h-10 gap-2 rounded-xl border-orange-200 bg-white/80 text-orange-700 hover:bg-orange-50 hover:text-orange-800 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 dark:bg-orange-950/20 dark:border-orange-800/50 dark:text-orange-400 dark:hover:bg-orange-900/30"
        >
          <Plus className="h-4 w-4" />
          Upload PDF
        </Button>
      </div>
    </div>

    {/* External Link Card */}
    <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-purple-50 via-white to-violet-50 dark:from-purple-950/30 dark:via-card dark:to-violet-950/30 p-5 shadow-sm hover:shadow-lg transition-all duration-300 md:col-span-2 xl:col-span-1">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">External Link</h3>
            <p className="text-xs text-muted-foreground">Add external resources</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAddLink}
          className="w-full h-10 gap-2 rounded-xl border-purple-200 bg-white/80 text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 dark:bg-purple-950/20 dark:border-purple-800/50 dark:text-purple-400 dark:hover:bg-purple-900/30"
        >
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </div>
    </div>
  </div>
);

export default UploadActions;
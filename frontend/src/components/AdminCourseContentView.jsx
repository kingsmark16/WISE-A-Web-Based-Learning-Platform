import { BookOpen } from "lucide-react";
import ModuleContent from "./courseNav/ModuleContent";

const AdminCourseContentView = ({ courseId }) => {
  return (
    <div className="mt-8 w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Course Content</h2>
      </div>

      {/* Content Display */}
      <div className="mt-6">
        <ModuleContent courseId={courseId} isAdminView={true} />
      </div>
    </div>
  );
};

export default AdminCourseContentView;

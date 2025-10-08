import SortableLesson from "./SortableLesson";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText } from "lucide-react";

/* 
  LessonList now simply renders SortableLesson items.
  The actual DnD context and drag handlers are provided by the parent (SortableModule).
*/
const LessonList = ({
  lessons,
  onPlayLesson,
  onEditLesson,
  onDeleteLesson,
  editPending = false,
}) => {
  const pdfCount = lessons.filter(lesson => lesson.type && String(lesson.type).toLowerCase() === "pdf").length;
  const videoCount = lessons.filter(lesson => !lesson.type || String(lesson.type).toLowerCase() !== "pdf").length;

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h5 className="font-semibold text-sm md:text-base text-foreground flex items-center gap-2">
          Lessons
        </h5>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-white">
            {videoCount} video{videoCount !== 1 ? "s" : ""}
          </Badge>
          {pdfCount > 0 && (
            <Badge variant="destructive">
              {pdfCount} PDF{pdfCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 w-full overflow-hidden">
        {lessons.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                No Lessons Yet
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-sm">
                Start building your course by adding video lessons or PDF documents.
                Drag and drop to reorder them once you have some content.
              </p>
            </CardContent>
          </Card>
        ) : (
          lessons.map((lesson, idx) => (
            <SortableLesson
              key={lesson.id}
              lesson={lesson}
              index={idx}
              onPlayLesson={onPlayLesson}
              onEditLesson={onEditLesson}
              onDeleteLesson={onDeleteLesson}
              editPending={editPending}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LessonList;
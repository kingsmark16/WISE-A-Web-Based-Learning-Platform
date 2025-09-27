import SortableLesson from "./SortableLesson";

/* 
  LessonList now simply renders SortableLesson items.
  The actual DnD context and drag handlers are provided by the parent (SortableModule).
*/
const LessonList = ({
  lessons,
  formatDuration,
  onPlayLesson,
  onEditLesson,
  onDeleteLesson,
}) => (
  <div>
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <h5 className="font-semibold text-base text-foreground flex items-center gap-2">
        Lessons
      </h5>
      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
        {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
      </span>
    </div>

    <div className="space-y-2 sm:space-y-3">
      {lessons.map((lesson, idx) => (
        <SortableLesson
          key={lesson.id}
          lesson={lesson}
          index={idx}
          formatDuration={formatDuration}
          onPlayLesson={onPlayLesson}
          onEditLesson={onEditLesson}
          onDeleteLesson={onDeleteLesson}
        />
      ))}
    </div>
  </div>
);

export default LessonList;
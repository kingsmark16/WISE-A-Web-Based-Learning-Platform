import { Play, Edit3, Trash2 } from "lucide-react";

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
        <Play className="h-4 w-4 text-primary" />
        Lessons
      </h5>
      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
        {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
      </span>
    </div>
    <div className="space-y-2 sm:space-y-3">
      {lessons.map((lesson, idx) => (
        <div
          key={lesson.id}
          className="group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-card border border-border hover:border-primary/20 hover:bg-accent/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          onClick={() => onPlayLesson(idx)}
        >
          {/* Thumbnail and Play Button */}
          <div className="relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-md overflow-hidden bg-muted hidden sm:block">
            {lesson.type && lesson.type.toLowerCase() === "pdf" ? (
              <img
                src="/pdf.png"
                alt="PDF"
                className="w-full h-full object-contain"
              />
            ) : lesson.thumbnail ? (
              <img
                src={lesson.thumbnail}
                alt={lesson.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
                style={{ display: "flex" }}
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}
            {lesson.type && lesson.type.toLowerCase() !== "pdf" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary/10 hover:bg-primary/20 text-primary rounded-full p-2 sm:p-3 transition-all duration-200 group-hover:scale-110">
                  <Play className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
            )}
            {lesson.duration && formatDuration(lesson.duration) && (
              <div className="absolute bottom-1 right-0 text-white text-xs sm:text-sm px-1.5 py-0.5 rounded font-medium">
                {formatDuration(lesson.duration)}
              </div>
            )}
          </div>
          {/* Lesson Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1 sm:gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full flex-shrink-0">
                  {idx + 1}
                </span>
                <h6 className="text-xs sm:text-sm md:text-base font-semibold leading-tight text-foreground block whitespace-normal break-words overflow-hidden min-w-0">
                  {lesson.title}
                </h6>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-transparent rounded-md p-1">
            <div
              role="button"
              tabIndex={0}
              title="Edit lesson"
              aria-label="Edit lesson"
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60"
              onClick={(e) => {
                e.stopPropagation();
                onEditLesson(lesson, e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onEditLesson(lesson, e);
                }
              }}
            >
              <Edit3 className="h-4 w-4" />
            </div>
            <div
              role="button"
              tabIndex={0}
              title="Delete lesson"
              aria-label="Delete lesson"
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-destructive/60"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteLesson(lesson, e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDeleteLesson(lesson, e);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LessonList;
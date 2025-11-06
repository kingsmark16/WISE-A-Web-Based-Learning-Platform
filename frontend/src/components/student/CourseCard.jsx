import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, BookOpen } from 'lucide-react';

/**
 * CourseCard Component - Display individual course with progress
 * 
 * @param {Object} course - Course data object
 * @param {string} course.id - Course ID
 * @param {string} course.title - Course title
 * @param {string} course.description - Course description
 * @param {string} course.thumbnail - Course thumbnail image URL
 * @param {string} course.college - Course college
 * @param {Object} course.managedBy - Faculty information
 * @param {string} course.managedBy.fullName - Faculty name
 * @param {string} course.managedBy.imageUrl - Faculty image URL
 * @param {number} course.totalEnrollments - Total students enrolled
 * @param {number} course.totalModules - Total modules in course
 * @param {number} course.totalLessons - Total lessons in course
 * @param {Object} course.progress - Student's progress
 * @param {number} course.progress.percentage - Progress percentage (0-100)
 * @param {number} course.progress.lessonsCompleted - Lessons completed
 */
export const CourseCard = ({ course }) => {
  const progressPercentage = course.progress?.percentage || 0;

  return (
    <Link to={`/student/homepage/${course.id}/selected-course`}>
      <Card className="h-96 flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer p-0">
        {/* Course Thumbnail */}
        <div className="relative w-full h-48 flex-shrink-0 overflow-hidden bg-muted flex items-center justify-center">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <BookOpen className="w-12 h-12 text-slate-400" />
          )}
        </div>

        <div className="flex flex-col flex-1">
          <CardHeader className="pb-2 flex-shrink-0">
            {/* Title */}
            <div className="text-center">
              <h3 className="text-md font-semibold line-clamp-1 text-primary hover:text-primary/80 transition-colors">
                {course.title}
              </h3>
            </div>
            
            {/* College */}
            <div className="flex justify-center">
              <Badge variant="outline">
                {course.college}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-between space-y-3 pb-4">
            {/* Faculty Info */}
            {course.managedBy && (
              <div className="flex items-center gap-3 pb-2 border-b flex-shrink-0">
                {course.managedBy.imageUrl ? (
                  <img
                    src={course.managedBy.imageUrl}
                    alt={course.managedBy.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {course.managedBy.fullName || 'Unknown Faculty'}
                  </p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>
            )}

            {/* Progress Bar - Always at bottom */}
            <div className="space-y-2 mt-auto">
              <div className="flex justify-between items-center">
                <p className="text-xs font-medium">Your Progress</p>
                <p className="text-xs text-muted-foreground">{progressPercentage}%</p>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
};

export default CourseCard;

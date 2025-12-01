import { useEnrollInCourse } from '@/hooks/courses/useCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, BookOpen } from 'lucide-react';
import { useState } from 'react';

/**
 * JoinCourse Page - Allow students to join a course using a course code
 */
const JoinCourse = () => {
  const [courseCode, setCourseCode] = useState('');
  const { mutate: enrollCourse, isPending: isEnrolling } = useEnrollInCourse();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (courseCode.trim()) {
      enrollCourse({ courseCode: courseCode.trim() });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Join a Course</CardTitle>
          <CardDescription>
            Enter the course code provided by your instructor to enroll in a course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code</Label>
              <Input
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="text-center text-lg tracking-wider"
                maxLength={10}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={!courseCode.trim() || isEnrolling}
            >
              {isEnrolling ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Join Course
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinCourse;

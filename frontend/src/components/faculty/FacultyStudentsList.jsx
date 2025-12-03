import { useFacultyEnrolledStudents } from '@/hooks/faculty/useFacultyEnrolledStudents';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


const formatRelativeTime = (date) => {
  if (!date) return "Never";

  const now = new Date();
  const past = new Date(date);
  const diffInMs = now - past;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 120) {
    return "Active now";
  } else if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  } else {
    return `${diffInDays} days ago`;
  }
};

// Live updating component with status indicator
const LiveRelativeTime = ({ date }) => {
  const [relativeTime, setRelativeTime] = useState(formatRelativeTime(date));
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const newTime = formatRelativeTime(date);
      setRelativeTime(newTime);
      setIsActive(newTime === "Active now");
    };

    updateTime();

    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <span className="inline-flex items-center gap-2">
      {isActive && (
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      )}
      {relativeTime}
    </span>
  );
};

const FacultyStudentsList = ({ courseId }) => {
  const { data: students, isLoading, error } = useFacultyEnrolledStudents(courseId);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="overflow-x-auto">
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead className="w-[30%] text-center">Progress</TableHead>
                  <TableHead className="w-[30%] text-center">Last Active</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load enrolled students. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-muted mb-4">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground mb-1">No students enrolled</p>
        <p className="text-sm text-muted-foreground">Students will appear here as they enroll</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Enrolled Students ({students.length})</h2>
      </div>

      <div className="overflow-x-auto">
        <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[40%] font-semibold text-sm py-3 text-left text-foreground">Name</TableHead>
                  <TableHead className="w-[30%] text-center font-semibold text-sm py-3 text-foreground">Progress</TableHead>
                  <TableHead className="w-[30%] text-center font-semibold text-sm py-3 text-foreground">Last Active</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-primary/5 transition-all duration-200 hover:shadow-sm cursor-pointer">
                  <TableCell className="py-4 text-base text-left">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{student.fullName}</p>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center text-base font-bold text-primary">
                    {student.progress.percentage}%
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center text-base">
                    <LiveRelativeTime date={student.lastAccessedAt} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
      </div>
    </div>
  );
};

export default FacultyStudentsList;

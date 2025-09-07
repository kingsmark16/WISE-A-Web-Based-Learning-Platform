import { useParams } from "react-router-dom";
import { useGetSingleFaculty } from "../../../hooks/analytics/adminAnalytics/useGetFaculty";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

// Updated formatRelativeTime function to show "Active now"
const formatRelativeTime = (date) => {
  if (!date) return "Never";

  const now = new Date();
  const past = new Date(date);
  const diffInMs = now - past;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // Show "Active now" if last active within 2 minutes (user is currently logged in)
  if (diffInSeconds < 120) {
    return "Active now";
  } else if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? "1 minute ago"
      : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  } else if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
  } else if (diffInMonths < 12) {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  } else {
    return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
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

    // Update immediately
    updateTime();

    // Set up interval for updates every 30 seconds
    const interval = setInterval(updateTime, 30000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <span className="flex items-center gap-2">
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

const FacultyInfo = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetSingleFaculty(id);
  const faculty = data?.faculty;

  if (isLoading) {
    return (
      <div className="min-h-145 max-w-6xl mx-auto mt-10">
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-8 w-1/4 mb-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 text-center text-destructive">
        Error: {error.message}
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="mx-auto mt-10 text-center text-muted-foreground">
        Faculty Not Found
      </div>
    );
  }

  // Check if currently active for badge styling
  const isCurrentlyActive = formatRelativeTime(faculty.lastActiveAt) === "Active now";

  return (
    <div className="max-w-6xl mx-auto mt-5 md:mt-10 space-y-8">
      <Card className="min-h-145">
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={faculty.imageUrl} alt={faculty.fullName} />
            <AvatarFallback>
              {faculty.fullName?.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">
              {faculty.fullName}
            </CardTitle>
            <div className="text-muted-foreground">
              {faculty.emailAddress}
            </div>
            <div className="mt-2">
              <Badge 
                variant={isCurrentlyActive ? "default" : "outline"}
                className={isCurrentlyActive ? "bg-green-500 hover:bg-green-600 text-white" : ""}
              >
                <LiveRelativeTime date={faculty.lastActiveAt} />
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Managed Courses</h3>
              {faculty.managedCourses?.length > 0 ? (
                <ul className="space-y-2">
                  {faculty.managedCourses.map((course) => (
                    <li key={course.id} className="flex items-center gap-2">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <span className="font-medium">{course.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted-foreground text-sm">
                  No managed courses.
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Created Courses</h3>
              {faculty.createdCourses?.length > 0 ? (
                <ul className="space-y-2">
                  {faculty.createdCourses.map((course) => (
                    <li key={course.id} className="flex items-center gap-2">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <span className="font-medium">{course.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted-foreground text-sm">
                  No created courses.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyInfo;
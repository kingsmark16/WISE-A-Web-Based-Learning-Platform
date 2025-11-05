import { useAuth, useUser } from '@clerk/clerk-react';
import { useFacultyCourseStats } from '@/hooks/faculty/useFacultyCourseStats';
import { Loader, BookOpen, CheckCircle, Clock, Archive } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/faculty/StatCard';
import AnalyticsOverview from '@/components/faculty/AnalyticsOverview';
import TopCoursesByEngagement from '@/components/faculty/TopCoursesByEngagement';

const FacultyDashboard = () => {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  
  // Debug full user object
  console.log('Full Clerk User Object:', user);
  console.log('User ID:', user?.id);
  console.log('Is Signed In:', isSignedIn);
  console.log('Auth Loaded:', authLoaded);
  console.log('User Loaded:', userLoaded);
  
  // Use user.id when available, or get from localStorage as fallback
  const facultyId = user?.id || (userLoaded && localStorage.getItem('userId'));
  
  const { data: courseStats, isLoading, error } = useFacultyCourseStats(facultyId);

  // Debug logging
  console.log('Faculty Dashboard - Clerk User ID:', user?.id);
  console.log('Faculty Dashboard - Faculty ID Being Used:', facultyId);
  console.log('Faculty Dashboard - User Loaded:', userLoaded);
  console.log('Faculty Dashboard - Course Stats:', courseStats);
  console.log('Faculty Dashboard - Is Loading:', isLoading);
  console.log('Faculty Dashboard - Error:', error);

  // Wait for user to load
  if (!userLoaded || !authLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is signed in
  if (!isSignedIn) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please sign in to access the faculty dashboard</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching stats
  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Key Metrics - Top Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 border rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>

        {/* Top Courses Section Skeleton */}
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-64" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading dashboard: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!facultyId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Unable to load dashboard - Faculty ID not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your course overview.</p>
      </div>

      {/* Key Metrics - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Courses"
          value={courseStats?.total}
          icon={BookOpen}
          color="bg-blue-500"
        />
        <StatCard
          title="Published"
          value={courseStats?.published}
          icon={CheckCircle}
          color="bg-green-500"
          trend="Active courses"
        />
        <StatCard
          title="Draft"
          value={courseStats?.draft}
          icon={Clock}
          color="bg-yellow-500"
          trend="In progress"
        />
        <StatCard
          title="Archived"
          value={courseStats?.archived}
          icon={Archive}
          color="bg-gray-500"
          trend="Archived"
        />
      </div>

      {/* Comprehensive Analytics Dashboard */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>
        <AnalyticsOverview courseStats={courseStats} />
      </div>

      {/* Top Courses by Engagement */}
      <div>
        <TopCoursesByEngagement facultyId={facultyId} />
      </div>
    </div>
  );
}

export default FacultyDashboard;
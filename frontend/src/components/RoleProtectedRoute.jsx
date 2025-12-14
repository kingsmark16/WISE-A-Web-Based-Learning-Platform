import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoaded } = useUser();
  
  // Get role from Clerk metadata first, fallback to localStorage
  const clerkRole = user?.publicMetadata?.role;
  const localRole = localStorage.getItem('userRole');
  const userRole = clerkRole || localRole;

  console.log('RoleProtectedRoute - User role:', userRole);
  console.log('RoleProtectedRoute - Allowed roles:', allowedRoles);

  // Wait for user to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 border-4 border-muted rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-medium text-muted-foreground tracking-wide">
                VERIFYING ACCESS
            </p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (!userRole || !allowedRoles.includes(userRole)) {
    console.log('Access denied - redirecting to appropriate page');
    
    // Redirect based on user's actual role
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin/analytics" replace />;
    } else if (userRole === 'FACULTY') {
      return <Navigate to="/faculty/faculty-dashboard" replace />;
    } else if (userRole === 'STUDENT') {
      return <Navigate to="/student/my-courses" replace />;
    }
    
    // If no role, redirect to sign in
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

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
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 text-emerald-500 animate-spin" />
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
      return <Navigate to="/faculty/faculty-homepage" replace />;
    } else if (userRole === 'STUDENT') {
      return <Navigate to="/student/student-homepage" replace />;
    }
    
    // If no role, redirect to sign in
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
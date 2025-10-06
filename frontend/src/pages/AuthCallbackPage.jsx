import {Loader} from 'lucide-react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSyncUser } from "../hooks/useAuth.js";

const AuthCallbackPage = () => {

  const {data, isLoading, error, isSuccess} = useSyncUser();
  const navigate = useNavigate();
  const [hasNavigated, setHasNavigated] = useState(false);


  useEffect(() => {
    if(isSuccess && data && !hasNavigated) {
      console.log('User synced successfully', data);

      const userRole = data.user.role;

      // Store role in localStorage as fallback for immediate use
      localStorage.setItem('userRole', userRole);
      
      setHasNavigated(true);

      console.log('Navigating to dashboard with role:', userRole);
      
      // Navigate based on role
      switch (userRole) {
        case 'ADMIN':
          navigate('/admin/analytics', {replace: true});
          break;
        case 'FACULTY':
          navigate('/faculty/faculty-homepage', {replace: true});
          break;
        case 'STUDENT':
          navigate('/student/student-homepage', {replace: true});
          break;
        default:
          navigate('/sign-in', {replace: true});
      }
    }

    if(error) {
      console.error('Error syncing user: ', error)
      navigate('/sign-in');
    }
  },[data, isLoading, error, isSuccess, navigate, hasNavigated])

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error.message}</p>
          <button 
            onClick={() => navigate('/sign-in')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="h-screen w-full flex items-center justify-center flex-col gap-4">
      <Loader className="size-8 text-emerald-500 animate-spin" />
      <p className="text-muted-foreground">Setting up your account...</p>
    </div>
  )
}

export default AuthCallbackPage
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSyncUser } from "../hooks/useAuth.js";
import { PulseLoader } from 'react-spinners';

const AuthCallbackPage = () => {

  const {data, isLoading, error, isSuccess} = useSyncUser();
  const navigate = useNavigate();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Verifying your account...");


  useEffect(() => {
    // Update loading message after 2 seconds
    const timer = setTimeout(() => {
      setLoadingMessage("Setting up your workspace...");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if(isSuccess && data && !hasNavigated) {
      console.log('User synced successfully', data);

      const userRole = data.user.role;

      // Store role in localStorage as fallback for immediate use
      localStorage.setItem('userRole', userRole);
      
      setLoadingMessage("Redirecting to your dashboard...");
      setHasNavigated(true);

      console.log('Navigating to dashboard with role:', userRole);
      
      // Navigate based on role
      setTimeout(() => {
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
      }, 500);
    }

    if(error) {
      console.error('Error syncing user: ', error)
      navigate('/sign-in');
    }
  },[data, isLoading, error, isSuccess, navigate, hasNavigated])

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-6">{error.message || "Something went wrong. Please try again."}</p>
          <button 
            onClick={() => navigate('/sign-in')}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 shadow-lg"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur-xl opacity-30"></div>
            <img 
              src="https://res.cloudinary.com/dnpyjolgh/image/upload/v1756286085/New_PSU_Logo_COLORED_PNG_klqhtg.png" 
              alt="PSU Logo" 
              className="w-24 h-24 mx-auto relative z-10"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="mb-6">
          <PulseLoader 
            color="hsl(var(--primary))" 
            size={15}
            margin={8}
            speedMultiplier={0.8}
          />
        </div>

        {/* Loading Message */}
        <h2 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">
          Welcome to WISE
        </h2>
        <p className="text-muted-foreground text-lg animate-fade-in animation-delay-200">
          {loadingMessage}
        </p>

        {/* Progress Indicator */}
        <div className="mt-8 max-w-xs mx-auto">
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full animate-progress shadow-lg shadow-primary/50"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 60%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default AuthCallbackPage
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/clerk-react"
import { PulseLoader } from 'react-spinners'
import { useSyncUser } from "../hooks/useAuth.js"

const RedirectIfSignedIn = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser()
  const navigate = useNavigate()
  const [loadingMessage, setLoadingMessage] = useState("Checking authentication...");
  
  // Sync user with backend whenever they sign in
  const { data: syncData, isSuccess: isSyncSuccess } = useSyncUser()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setLoadingMessage("Loading your profile...");
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Wait for sync to complete
      if (isSyncSuccess && syncData) {
        const role = syncData.user.role
        console.log('User synced, role:', role)
        
        // Store role in localStorage
        localStorage.setItem('userRole', role)

        setLoadingMessage("Redirecting to dashboard...");

        setTimeout(() => {
          if (role === "FACULTY") {
            navigate("/faculty/faculty-dashboard", { replace: true })
          } else if (role === "STUDENT") {
            navigate("/student/student-homepage", { replace: true })
          } else if (role === "ADMIN") {
            navigate("/admin/analytics", { replace: true })
          }
        }, 500);
      }
    }
  }, [isSignedIn, isLoaded, user, isSyncSuccess, syncData, navigate])

  if (!isLoaded || isSignedIn) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          {/* Logo with Glow Effect */}
          <div className="mb-8 animate-bounce-slow">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur-2xl opacity-20"></div>
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
          <p className="text-foreground text-lg font-medium animate-fade-in">
            {loadingMessage}
          </p>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse animation-delay-200 shadow-lg shadow-emerald-500/50"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-400 shadow-lg shadow-primary/50"></div>
          </div>
        </div>

        <style>{`
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }

          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }

          .animation-delay-200 {
            animation-delay: 0.2s;
          }

          .animation-delay-400 {
            animation-delay: 0.4s;
          }
        `}</style>
      </div>
    )
  }

  return children
}

export default RedirectIfSignedIn
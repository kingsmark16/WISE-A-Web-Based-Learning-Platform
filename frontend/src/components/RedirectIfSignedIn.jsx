import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/clerk-react"
import { useSyncUser } from "../hooks/useAuth.js"

const RedirectIfSignedIn = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser()
  const navigate = useNavigate()
  const [loadingMessage, setLoadingMessage] = useState("Checking authentication...");
  const [step, setStep] = useState(1);
  
  // Sync user with backend whenever they sign in
  const { data: syncData, isSuccess: isSyncSuccess } = useSyncUser()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setLoadingMessage("Loading your profile...");
      setStep(2);
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
        setStep(3);

        setTimeout(() => {
          if (role === "FACULTY") {
            navigate("/faculty/faculty-dashboard", { replace: true })
          } else if (role === "STUDENT") {
            navigate("/student/my-courses", { replace: true })
          } else if (role === "ADMIN") {
            navigate("/admin/analytics", { replace: true })
          }
        }, 500);
      }
    }
  }, [isSignedIn, isLoaded, user, isSyncSuccess, syncData, navigate])

  if (!isLoaded || isSignedIn) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <div className="w-full max-w-md px-4 flex flex-col items-center">
          {/* Logo Section */}
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative h-24 w-24 md:h-28 md:w-28 transition-transform duration-700 hover:scale-105">
              <img 
                src="https://res.cloudinary.com/dnpyjolgh/image/upload/v1756286085/New_PSU_Logo_COLORED_PNG_klqhtg.png" 
                alt="PSU Logo" 
                className="h-full w-full object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center space-y-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Welcome Back
              </h2>
              <p className="text-muted-foreground text-lg font-medium">
                {loadingMessage}
              </p>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full max-w-[200px] h-1 bg-muted overflow-hidden rounded-full">
              <div 
                className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-8 text-center">
          <p className="text-xs text-muted-foreground/50 font-medium tracking-widest uppercase">
            WISE Learning Platform
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default RedirectIfSignedIn
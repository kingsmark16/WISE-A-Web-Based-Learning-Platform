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
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          {/* Card Container */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <img 
                    src="https://res.cloudinary.com/dnpyjolgh/image/upload/v1756286085/New_PSU_Logo_COLORED_PNG_klqhtg.png" 
                    alt="PSU Logo" 
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Spinner */}
            <div className="flex justify-center mb-6">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-muted" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-emerald-500/50 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
            </div>

            {/* Message */}
            <p className="text-center text-sm sm:text-base font-medium text-foreground mb-6">
              {loadingMessage}
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-500 ${
                    step >= s 
                      ? 'bg-primary scale-100' 
                      : 'bg-muted scale-75'
                  }`} />
                  {s < 3 && (
                    <div className={`w-6 sm:w-8 h-0.5 transition-all duration-500 ${
                      step > s ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            WISE Learning Platform
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default RedirectIfSignedIn
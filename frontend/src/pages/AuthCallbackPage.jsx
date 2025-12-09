import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSyncUser } from "../hooks/useAuth.js";
import { CheckCircle2, XCircle, User, Sparkles, ArrowRight } from "lucide-react";

const AuthCallbackPage = () => {
  const {data, isLoading, error, isSuccess} = useSyncUser();
  const navigate = useNavigate();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);

  const steps = [
    { id: 1, label: "Verifying account", icon: User },
    { id: 2, label: "Setting up workspace", icon: Sparkles },
    { id: 3, label: "Redirecting", icon: ArrowRight },
  ];

  useEffect(() => {
    // Animate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 50);

    const timer1 = setTimeout(() => setStep(2), 1500);
    const timer2 = setTimeout(() => {
      if (!error) setStep(3);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [error]);

  useEffect(() => {
    if(isSuccess && data && !hasNavigated) {
      console.log('User synced successfully', data);
      const userRole = data.user.role;
      localStorage.setItem('userRole', userRole);
      setStep(3);
      setHasNavigated(true);

      setTimeout(() => {
        switch (userRole) {
          case 'ADMIN':
            navigate('/admin/analytics', {replace: true});
            break;
          case 'FACULTY':
            navigate('/faculty/faculty-dashboard', {replace: true});
            break;
          case 'STUDENT':
            navigate('/student/my-courses', {replace: true});
            break;
          default:
            navigate('/sign-in', {replace: true});
        }
      }, 800);
    }

    if(error) {
      console.error('Error syncing user: ', error)
    }
  },[data, isLoading, error, isSuccess, navigate, hasNavigated])

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
        <div className="w-full max-w-sm bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-2">Authentication Error</h2>
          <p className="text-sm text-center text-muted-foreground mb-6">{error.message || "Something went wrong. Please try again."}</p>
          <button 
            onClick={() => navigate('/sign-in')}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
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

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-2">
            Welcome to WISE
          </h2>
          <p className="text-sm text-center text-muted-foreground mb-6">
            Setting up your learning experience
          </p>

          {/* Progress Steps */}
          <div className="space-y-3 mb-6">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              
              return (
                <div 
                  key={s.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 
                    isCompleted ? 'bg-muted/50' : 'opacity-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isCompleted ? 'bg-emerald-500 text-white' :
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {s.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          WISE Learning Platform
        </p>
      </div>
    </div>
  )
}

export default AuthCallbackPage
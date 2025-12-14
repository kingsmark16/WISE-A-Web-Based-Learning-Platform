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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 flex flex-col items-center space-y-12">
        {/* Header */}
        <div className="flex flex-col items-center space-y-6 text-center">
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                <img 
                    src="https://res.cloudinary.com/dnpyjolgh/image/upload/v1756286085/New_PSU_Logo_COLORED_PNG_klqhtg.png" 
                    alt="PSU Logo" 
                    className="relative h-20 w-20 object-contain drop-shadow-xl"
                />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Welcome to WISE</h2>
                <p className="text-muted-foreground">Setting up your workspace</p>
            </div>
        </div>

        {/* Minimal Steps */}
        <div className="w-full space-y-6">
            {steps.map((s, index) => {
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              
              return (
                <div key={s.id} className="relative flex items-center gap-4 group">
                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                        <div className={`absolute left-[19px] top-10 w-0.5 h-8 transition-colors duration-500 ${
                            isCompleted ? 'bg-primary' : 'bg-muted'
                        }`} />
                    )}
                    
                    {/* Icon Circle */}
                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 ${
                        isActive ? 'border-primary bg-background scale-110 shadow-lg shadow-primary/20' : 
                        isCompleted ? 'border-primary bg-primary text-primary-foreground' : 
                        'border-muted bg-background text-muted-foreground'
                    }`}>
                        {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <s.icon className={`w-4 h-4 ${isActive ? 'text-primary animate-pulse' : ''}`} />
                        )}
                    </div>

                    {/* Text */}
                    <div className="flex flex-col">
                        <span className={`text-sm font-medium transition-colors duration-300 ${
                            isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                            {s.label}
                        </span>
                        {isActive && (
                            <span className="text-xs text-primary animate-pulse">Processing...</span>
                        )}
                    </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  )
}

export default AuthCallbackPage
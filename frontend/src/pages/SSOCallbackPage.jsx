import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { PulseLoader } from 'react-spinners'

const SSOCallbackPage = () => {
    
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
        <h2 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">
          Completing Sign In
        </h2>
        <p className="text-muted-foreground text-lg animate-fade-in animation-delay-200">
          Please wait while we set up your account...
        </p>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse animation-delay-200 shadow-lg shadow-emerald-500/50"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-400 shadow-lg shadow-primary/50"></div>
        </div>
      </div>

      <AuthenticateWithRedirectCallback 
        signUpForceRedirectUrl={'/auth-callback'}
        signInForceRedirectUrl={'/auth-callback'}
      />

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
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  )
}

export default SSOCallbackPage
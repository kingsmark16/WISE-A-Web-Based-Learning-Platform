import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { Shield } from 'lucide-react'

const SSOCallbackPage = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 flex flex-col items-center space-y-8">
        {/* Logo */}
        <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <img 
                src="https://res.cloudinary.com/dnpyjolgh/image/upload/v1756286085/New_PSU_Logo_COLORED_PNG_klqhtg.png" 
                alt="PSU Logo" 
                className="relative h-24 w-24 object-contain drop-shadow-2xl"
            />
        </div>
        
        {/* Content */}
        <div className="flex flex-col items-center space-y-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold tracking-tight">Completing Sign In</h2>
            <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Verifying credentials</span>
                <span className="flex gap-1 ml-1">
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                </span>
            </div>
        </div>
      </div>

      <AuthenticateWithRedirectCallback 
        signUpForceRedirectUrl={'/auth-callback'}
        signInForceRedirectUrl={'/auth-callback'}
      />
    </div>
  )
}

export default SSOCallbackPage
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'


const SSOCallbackPage = () => {
    

  
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Completing sign in...</h2>
        <p className="mt-2 text-sm text-gray-600">Please wait while we set up your account</p>
      </div>
      <AuthenticateWithRedirectCallback 
        signUpForceRedirectUrl={'/auth-callback'}
        signInForceRedirectUrl={'/auth-callback'}
      />
    </div>
  )
}

export default SSOCallbackPage
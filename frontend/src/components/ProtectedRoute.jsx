import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

const ProtectedRoute = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
)

export default ProtectedRoute
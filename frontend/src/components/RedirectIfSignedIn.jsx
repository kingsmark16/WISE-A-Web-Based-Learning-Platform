import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { Loader } from 'lucide-react'
import { useSyncUser } from "../hooks/useAuth.js"

const RedirectIfSignedIn = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser()
  const navigate = useNavigate()
  
  // Sync user with backend whenever they sign in
  const { data: syncData, isSuccess: isSyncSuccess } = useSyncUser()

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Wait for sync to complete
      if (isSyncSuccess && syncData) {
        const role = syncData.user.role
        console.log('User synced, role:', role)
        
        // Store role in localStorage
        localStorage.setItem('userRole', role)

        if (role === "FACULTY") {
          navigate("/faculty/faculty-homepage", { replace: true })
        } else if (role === "STUDENT") {
          navigate("/student/student-homepage", { replace: true })
        } else if (role === "ADMIN") {
          navigate("/admin/analytics", { replace: true })
        }
      }
    }
  }, [isSignedIn, isLoaded, user, isSyncSuccess, syncData, navigate])

  if (!isLoaded || isSignedIn) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return children
}

export default RedirectIfSignedIn
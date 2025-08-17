import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { Loader } from 'lucide-react'

const RedirectIfSignedIn = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const role = user?.publicMetadata?.role
      console.log(role);

      if(!role){
        return;
      }
      
      if (role === "FACULTY") {
        navigate("/faculty", { replace: true })
      } else if (role === "STUDENT") {
        navigate("/student", { replace: true })
      } else {
        navigate("/admin", { replace: true }) // fallback or admin
      }
    }
  }, [isSignedIn, isLoaded, user, navigate])

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
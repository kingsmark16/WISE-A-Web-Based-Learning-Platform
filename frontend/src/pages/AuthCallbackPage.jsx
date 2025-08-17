
import {Loader} from 'lucide-react';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSyncUser } from "../hooks/useAuth.js";

const AuthCallbackPage = () => {

  const {data, isLoading, error, isSuccess} = useSyncUser();
  const navigate = useNavigate();


  useEffect(() => {
    if(isSuccess && data) {
      console.log('User synced successfully', data);

     
      const userRole = data.user.role;

      switch (userRole) {
        case 'ADMIN':
          navigate('/admin', {replace: true});
          break;
        case 'FACULTY':
          navigate('/faculty');
          break;
        case 'STUDENT':
          navigate('/student');
          break;
        default:
          navigate('/student');
      }
    }

    if(error) {
      console.error('Error syncing user: ', error)
      navigate('/sign-in');
    }
  },[data, isLoading, error, isSuccess, navigate])

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error.message}</p>
          <button 
            onClick={() => navigate('/sign-in')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div>
    
    <Loader/>
    SAVING
      
    </div>
  )
}

export default AuthCallbackPage
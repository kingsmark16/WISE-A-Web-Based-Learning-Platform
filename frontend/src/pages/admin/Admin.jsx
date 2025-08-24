import { SignOutButton, UserButton } from '@clerk/clerk-react'
import { useAdminDashboard } from '../../hooks/useAdminDashboard.js'
import { Loader } from 'lucide-react'
import { NavLink } from 'react-router-dom';
import { Outlet } from 'react-router-dom'

const Admin = () => {
  const { data, isLoading, error } = useAdminDashboard();
  

    console.log(data)
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 mx-auto" />
          <p className="mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          {/* Fix: Don't render data object directly */}
          <p className="text-red-600 mb-4">Error: {error.message}</p>
          <p className="text-sm text-gray-600">
            {error.response?.status === 403 ? 'Access denied - Admin role required' : 'Failed to load dashboard'}
          </p>
          <div className="mt-4 space-x-2">
            <UserButton />
            <SignOutButton>
              <button className="bg-red-600 text-white px-4 py-2 rounded">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    )
  }

  return (
   
    <div className="min-h-screen">
      <header className="shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className=''>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

              <div>
                <NavLink to="/admin/courses" className="text-blue-600 hover:underline">
                  Courses
                </NavLink>
              </div>
              
              <div>
                <NavLink to="/admin/analytics" className="text-blue-600 hover:underline">
                  Analytics
                </NavLink>
              </div>

            </div>
            <div className="flex items-center space-x-4">
              <UserButton />
              <SignOutButton>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>



      <main className="max-w-7xl mx-auto py-6 px-4">

        
          <Outlet />
      </main>
    </div>
    
  )
}

export default Admin
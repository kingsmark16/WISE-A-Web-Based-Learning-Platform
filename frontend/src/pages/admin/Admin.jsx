import { SignOutButton, UserButton } from '@clerk/clerk-react'
import { useAdminDashboard } from '../../hooks/useAdminDashboard.js'
import { Loader } from 'lucide-react'
import { NavLink } from 'react-router-dom';
import { Outlet } from 'react-router-dom'
import { useState } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';

const Admin = () => {
  const { data, isLoading, error } = useAdminDashboard();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

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
       
          <p className="text-red-600 mb-4">Error: {error.message}</p>
          <p className="text-sm text-gray-600">
            {error.response?.status === 403 ? 'Access denied - Admin role required' : 'Failed to load dashboard'}
          </p>
          <div className="mt-4 space-x-2">
            <UserButton />
            <SignOutButton>
              <button className="bg-red-600 px-4 py-2 rounded">
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
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        <main className="flex-1 pt-16 ml-0 lg:ml-64 transition-all duration-300 ease-in-out overflow-x-auto">
          <div className="p-4 min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Admin
import { Outlet } from 'react-router-dom'
import { useState } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';

const MainLayout = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

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

export default MainLayout
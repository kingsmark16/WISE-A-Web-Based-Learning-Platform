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
      
      <div className="flex pt-20"> {/* Increased padding-top for more space */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        <main className="flex-1 ml-0 lg:ml-64 min-h-[calc(100vh-5rem)] overflow-auto">
          <div className="p-6"> {/* Increased padding for better spacing */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
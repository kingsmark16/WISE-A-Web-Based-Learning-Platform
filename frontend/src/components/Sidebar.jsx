import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, Users, GraduationCap } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Faculty', path: '/admin/faculty', icon: Users },
    { name: 'Student', path: '/admin/students', icon: GraduationCap },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40
          transform transition-transform duration-300 ease-in-out flex-shrink-0
          lg:translate-x-0 lg:static lg:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ minWidth: '256px', maxWidth: '256px' }}
      >
        
        <div className="pt-6 p-6">
          <div className='mb-10'>
            <img src="https://res.cloudinary.com/dnpyjolgh/image/upload/v1756286085/New_PSU_Logo_COLORED_PNG_klqhtg.png" alt="PSU Logo" className='w-24 h-24 mx-auto' />
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose} // Close sidebar on mobile when item is clicked
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <IconComponent size={20} />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      
    </>
  );
};

export default Sidebar;
import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, Users, GraduationCap } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const menuConfig = {
  ADMIN: [
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Faculty', path: '/admin/faculty-management', icon: Users },
    { name: 'Student', path: '/admin/students', icon: GraduationCap },
  ],
  STUDENT: [
    { name: 'Home', path: '/student/homepage' },
    { name: 'My Courses', path: '/student/my-courses' },
    { name: 'Certification', path: '/student/certification' },
    { name: 'Analytics', path: '/student/analytics' },
  ],
  FACULTY: [
    { name: 'Courses', path: '/faculty/courses' },
    { name: 'Analytics', path: '/faculty/analytics' },
  ],
};

const Sidebar = ({ isOpen, onClose}) => {

  const {user} = useUser();

  const role = user.publicMetadata?.role;
  
  const menuItems = menuConfig[role] || [];

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
          fixed top-0 left-0 h-full w-64 bg-secondary border-r border z-30
          transform transition-transform duration-300 ease-in-out flex-shrink-0 overflow-y-auto
          lg:translate-x-0
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
                        ? 'bg-primary-foreground'
                        : 'hover:bg-primary-foreground/30'
                    }`
                  }
                >
                  {IconComponent && <IconComponent size={20} />}
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
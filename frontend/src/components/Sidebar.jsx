import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, Users, GraduationCap, ChevronDown, ChevronRight } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from 'react';

const menuConfig = {
  ADMIN: [
    { name: 'Analytics Dashboard', path: '/admin/analytics', icon: BarChart3 },
    { 
      name: 'Course Management', 
      icon: BookOpen,
      submenu: [
        { name: 'Manage Courses', path: '/admin/courses' },
        { name: 'My Courses', path: '/admin/my-courses' }
      ]
    },
    { 
      name: 'User Management', 
      icon: Users,
      submenu: [
        { name: 'Faculty', path: '/admin/faculty-management' },
        { name: 'Students', path: '/admin/students' }
      ]
    },
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
  const [expandedItems, setExpandedItems] = useState({});
  const {user} = useUser();
  const role = user.publicMetadata?.role;
  const menuItems = menuConfig[role] || [];

  const toggleSubmenu = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const renderMenuItem = (item) => {
    const IconComponent = item.icon;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedItems[item.name];

    if (!hasSubmenu) {
      // Regular menu item
      return (
        <NavLink
          key={item.name}
          to={item.path}
          onClick={onClose}
          className="block"
        >
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-10",
                isActive 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {IconComponent && <IconComponent className="h-4 w-4" />}
              <span className="font-medium">{item.name}</span>
            </Button>
          )}
        </NavLink>
      );
    }

    // Menu item with submenu
    return (
      <div key={item.name}>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 hover:bg-accent hover:text-accent-foreground"
          onClick={() => toggleSubmenu(item.name)}
        >
          {IconComponent && <IconComponent className="h-4 w-4" />}
          <span className="font-medium flex-1 text-left">{item.name}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.submenu.map((subItem) => (
              <NavLink
                key={subItem.name}
                to={subItem.path}
                onClick={onClose}
                className="block"
              >
                {({ isActive }) => (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-9 text-sm",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className="font-medium">{subItem.name}</span>
                  </Button>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r z-50",
          "transform transition-transform duration-300 ease-in-out flex-shrink-0",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ minWidth: '256px', maxWidth: '256px' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b">
            <div className="flex justify-center mb-2">
              <img 
                src="https://res.cloudinary.com/dnpyjolgh/image/upload/v1756286085/New_PSU_Logo_COLORED_PNG_klqhtg.png" 
                alt="PSU Logo" 
                className="w-20 h-20"
              />
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2">
              {menuItems.map(renderMenuItem)}
            </nav>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
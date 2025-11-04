import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, Users, GraduationCap, ChevronDown, ChevronRight, UserCog, FolderOpen, Plus, Library } from 'lucide-react';
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
      path: '/admin/courses',
      icon: BookOpen,
     
    },
    { 
      name: 'User Management', 
      icon: Users,
      submenu: [
        { name: 'Faculty', path: '/admin/faculty-management' },
        { name: 'Students', path: '/admin/student-management' }
      ]
    },
    { name: 'My Courses', path: '/faculty/courses', icon: FolderOpen },
  ],
  STUDENT: [
    { name: 'Home', path: '/student/student-homepage' },
    { name: 'My Courses', path: '/student/my-courses' },
    { name: 'Archived Courses', path: '/student/archived-courses' },
    { name: 'Achievements', path: '/student/achievements' },
  ],
  FACULTY: [
    { name: 'Dashboard', path: '/faculty/faculty-dashboard', icon: BarChart3 },
    { name: 'Create Course', path: '/faculty/create-course', icon: Plus },
    { 
      name: 'My Courses', 
      icon: Library,
      submenu: [
        { name: 'Active Courses', path: '/faculty/faculty-homepage' },
        { name: 'Draft Courses', path: '/faculty/draft-courses'},
        { name: 'Archived Courses', path: '/faculty/archived-courses'}
      ]
    },
    { name: 'Student Management', path: '/faculty/student-management', icon: Users },
  ],
};

const Sidebar = ({ isOpen, onClose}) => {
  const [expandedItems, setExpandedItems] = useState({});
  const { user, isLoaded } = useUser();
  
  // Get role from Clerk metadata first, fallback to localStorage
  const clerkRole = user?.publicMetadata?.role;
  const localRole = localStorage.getItem('userRole');
  const role = clerkRole || localRole;
  
  const menuItems = menuConfig[role] || [];

  // Log for debugging
  console.log('Sidebar - User loaded:', isLoaded);
  console.log('Sidebar - Clerk role:', clerkRole);
  console.log('Sidebar - Local role:', localRole);
  console.log('Sidebar - Final role:', role);
  console.log('Sidebar - Menu items:', menuItems);

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
            {!isLoaded ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-muted-foreground">Loading menu...</p>
              </div>
            ) : !role ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-muted-foreground">No role assigned</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-muted-foreground">No menu items available</p>
              </div>
            ) : (
              <nav className="space-y-2">
                {menuItems.map(renderMenuItem)}
              </nav>
            )}
          </ScrollArea>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
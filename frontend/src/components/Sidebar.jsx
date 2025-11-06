import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, Users, GraduationCap, ChevronDown, ChevronRight, UserCog, FolderOpen, Plus, Library, Facebook, Youtube, LogOut, Shield } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from 'react';
import { useCurrentUserProfile } from '../hooks/auth/useCurrentUserProfile';
import { useMode } from '../hooks/useMode';

const menuConfig = {
  ADMIN: (hasManagedCourses, mode) => {
    // If in instructor mode, show faculty menu instead
    if (mode === 'instructor' && hasManagedCourses) {
      return [
        { name: 'Dashboard', path: '/faculty/faculty-dashboard', icon: BarChart3 },
        { name: 'Create Course', path: '/faculty/create-course', icon: Plus },
        { 
          name: 'My Courses', 
          icon: Library,
          submenu: [
            { name: 'Active Courses', path: '/faculty/courses/active'},
            { name: 'Draft Courses', path: '/faculty/courses/draft'},
            { name: 'Archived Courses', path: '/faculty/courses/archived'}
          ]
        },
      ];
    }
    // Regular admin menu
    return [
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
    ];
  },
  STUDENT: () => [
    { name: 'Home', path: '/student/student-homepage' },
    { name: 'My Courses', path: '/student/my-courses' },
    { name: 'Archived Courses', path: '/student/archived-courses' },
    { name: 'Achievements', path: '/student/achievements' },
  ],
  FACULTY: () => [
    { name: 'Dashboard', path: '/faculty/faculty-dashboard', icon: BarChart3 },
    { name: 'Create Course', path: '/faculty/create-course', icon: Plus },
    { 
      name: 'My Courses', 
      icon: Library,
      submenu: [
        { name: 'Active Courses', path: '/faculty/courses/active'},
        { name: 'Draft Courses', path: '/faculty/courses/draft'},
        { name: 'Archived Courses', path: '/faculty/courses/archived'}
      ]
    },
  ],
};

const Sidebar = ({ isOpen, onClose}) => {
  const [expandedItems, setExpandedItems] = useState({});
  const { user, isLoaded } = useUser();
  const { data: profileData, isLoading: profileLoading, error: profileError } = useCurrentUserProfile();
  const { mode, switchToInstructor: _switchToInstructor, switchToAdmin: _switchToAdmin } = useMode();
  
  // Get role from Clerk metadata first, fallback to localStorage
  const clerkRole = user?.publicMetadata?.role;
  const localRole = localStorage.getItem('userRole');
  const role = clerkRole || localRole;
  
  // Check if admin has managed courses
  const hasManagedCourses = role === 'ADMIN' && profileData?.user?.totalManagedCourses > 0;
  
  // Get menu items based on role and managed courses status
  const menuItems = typeof menuConfig[role] === 'function' 
    ? menuConfig[role](hasManagedCourses, mode) 
    : (menuConfig[role] || []);

  // Log for debugging
  console.log('Sidebar - Mode:', mode);
  console.log('Sidebar - User loaded:', isLoaded);
  console.log('Sidebar - Profile loading:', profileLoading);
  console.log('Sidebar - Profile error:', profileError);
  console.log('Sidebar - Profile data:', profileData);
  console.log('Sidebar - Clerk role:', clerkRole);
  console.log('Sidebar - Local role:', localRole);
  console.log('Sidebar - Final role:', role);
  console.log('Sidebar - Has managed courses:', hasManagedCourses);
  console.log('Sidebar - Managed courses count:', profileData?.user?.totalManagedCourses);
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
          className="block group"
        >
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-9 px-3 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-accent text-accent-foreground shadow-md" 
                  : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
              )}
            >
              {IconComponent && <IconComponent className={cn("h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-accent-foreground" : "")} />}
              <span className="flex-1 text-left">{item.name}</span>
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
          className={cn(
            "w-full justify-start gap-3 h-9 px-3 text-sm font-medium transition-all duration-200",
            "text-foreground/70 hover:text-foreground hover:bg-accent/50"
          )}
          onClick={() => toggleSubmenu(item.name)}
        >
          {IconComponent && <IconComponent className="h-4 w-4 flex-shrink-0" />}
          <span className="font-medium flex-1 text-left">{item.name}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform" />
          )}
        </Button>
        
        {isExpanded && (
          <div className="ml-3 mt-1 space-y-1 border-l border-border/40 pl-3 py-1">
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
                      "w-full justify-start gap-3 h-8 px-2 text-xs font-medium transition-all duration-200",
                      isActive 
                        ? "bg-accent/60 text-accent-foreground" 
                        : "text-foreground/60 hover:text-foreground hover:bg-accent/40"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    <span>{subItem.name}</span>
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
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50",
          "transform transition-transform duration-300 ease-in-out flex-shrink-0",
          "lg:translate-x-0 shadow-lg lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ minWidth: '256px', maxWidth: '256px' }}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
          {/* Logo Section */}
          <div className="px-6 py-8 border-b border-border/50">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <img 
                  src="https://res.cloudinary.com/dnpyjolgh/image/upload/v1756286085/New_PSU_Logo_COLORED_PNG_klqhtg.png" 
                  alt="PSU Logo" 
                  className="w-14 h-14 relative z-10"
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold tracking-wider text-foreground uppercase">Partido State</p>
                <p className="text-xs text-muted-foreground">University</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-3 mt-2">
            {!isLoaded ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Loading menu...</p>
              </div>
            ) : !role ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-muted-foreground">No role assigned</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-muted-foreground">No menu items available</p>
              </div>
            ) : (
              <nav className="space-y-1">
                {menuItems.map(renderMenuItem)}
              </nav>
            )}
          </ScrollArea>

          {/* Mode Switch Section */}
          {role === 'ADMIN' && hasManagedCourses && (
            <div className="px-3 py-3 border-t border-border/50">
              {mode === 'admin' ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-9 text-sm font-medium border-border/50 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  onClick={() => _switchToInstructor()}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Instructor Mode</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-9 text-sm font-medium border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary transition-all duration-200"
                  onClick={() => _switchToAdmin()}
                >
                  <Shield className="h-4 w-4" />
                  <span>Back to Admin</span>
                </Button>
              )}
            </div>
          )}

          {/* Footer Section */}
          <div className="px-3 py-4 border-t border-border/50 bg-gradient-to-t from-muted/30 to-transparent space-y-4">
            {/* Social Media Section */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Follow Us</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  asChild 
                  className="h-8 w-8 rounded-lg border-border/40 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/50 transition-all duration-200"
                >
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <Youtube className="h-4 w-4" />
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  asChild 
                  className="h-8 w-8 rounded-lg border-border/40 hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/50 transition-all duration-200"
                >
                  <a href="https://www.facebook.com/share/1BTHYYTNtX/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-2 space-y-1 border-t border-border/40">
              <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
                © 2025 Partido State University
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
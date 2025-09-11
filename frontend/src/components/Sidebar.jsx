import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, Users, GraduationCap } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

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
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "w-full justify-start gap-3 h-10",
                        isActive 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-10",
                          isActive && "bg-accent text-accent-foreground"
                        )}
                      >
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        <span className="font-medium">{item.name}</span>
                      </Button>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
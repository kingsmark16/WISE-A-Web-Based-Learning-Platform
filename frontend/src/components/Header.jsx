import { useState } from "react"
import { UserButton } from "@clerk/clerk-react"
import { Search, X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Handle search logic here
    console.log("Searching for:", searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsSearchOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center py-6 px-5 md:py-6 lg:px-8 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 h-20">
      
      {/* Left side - Menu button and Logo */}
      <div className="flex justify-center items-center gap-3">
        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        
        <h2 className="text-lg md:text-2xl font-bold tracking-wide">WISE</h2>
      </div>
      
      {/* Search Bar - Desktop */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, faculty, students..."
              className="w-full pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Right side - Mobile Search Toggle & User Actions */}
      <div className="flex justify-center items-center gap-2">
        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="md:hidden"
        >
          {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </Button>
        
        <UserButton />
      </div>

      {/* Mobile Search Bar - Overlay */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b shadow-lg z-40">
          <div className="p-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, faculty, students..."
                  className="w-full pl-10 pr-10"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
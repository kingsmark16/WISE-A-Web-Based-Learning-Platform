import { useState, useEffect, useRef } from "react"
import { UserButton, useUser } from "@clerk/clerk-react"
import { useNavigate } from "react-router-dom"
import { Search, X, Menu, BookOpen, Users, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdminSearch } from "@/hooks/useAdminSearch"
import { useFacultySearch } from "@/hooks/faculty/useFacultySearch"
import { useStudentSearch } from "@/hooks/student/useStudentSearch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "./ThemeToggle"

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)
  const searchRef = useRef(null)

  // Check if user is admin, faculty, or student
  const isAdmin = user?.publicMetadata?.role === "ADMIN"
  const isFaculty = user?.publicMetadata?.role === "FACULTY"
  const isStudent = user?.publicMetadata?.role === "STUDENT"

  // Detect if any video player modal is open
  useEffect(() => {
    const checkVideoPlayer = () => {
      // Check for VideoPlayer (has role="dialog")
      const videoDialog = document.querySelector('[role="dialog"]')
      // Check for EmbedYt modal
      const embedYtModal = document.querySelector('.fixed.inset-0.z-\\[70\\]')
      setIsVideoPlayerOpen(!!(videoDialog || embedYtModal))
    }

    checkVideoPlayer()
    // Listen for DOM changes
    const observer = new MutationObserver(checkVideoPlayer)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch suggestions based on role
  const { data: adminSuggestions, isLoading: isAdminLoading } = useAdminSearch(debouncedQuery, {
    enabled: isAdmin && debouncedQuery.length > 0
  })

  const { data: facultySuggestions, isLoading: isFacultyLoading } = useFacultySearch(debouncedQuery, {
    enabled: isFaculty && debouncedQuery.length > 0
  })

  const { data: studentSuggestions, isLoading: isStudentLoading } = useStudentSearch(debouncedQuery, null, {
    enabled: isStudent && debouncedQuery.length > 0
  })

  // Select appropriate suggestions based on role
  const suggestions = isAdmin ? adminSuggestions : isFaculty ? facultySuggestions : studentSuggestions
  const isSuggestionsLoading = isAdmin ? isAdminLoading : isFaculty ? isFacultyLoading : isStudentLoading

  // Show suggestions when there's a query and data
  useEffect(() => {
    if (debouncedQuery.length > 0 && suggestions) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [debouncedQuery, suggestions])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking the search toggle button
      if (event.target.closest('button')?.classList.contains('md:hidden')) {
        return // This is the search toggle button, don't close
      }
      
      // Close if clicking outside the search ref
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setIsSearchOpen(false)
      }
    }

    // Also close search when clicking anywhere on the document
    const closeSearchOnClick = (event) => {
      // Skip if it's a button click
      if (event.target.closest('button')) return
      
      if (isSearchOpen && searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("click", closeSearchOnClick)
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("click", closeSearchOnClick)
    }
  }, [isSearchOpen])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    if (!searchQuery.trim()) return
    
    // Navigate to appropriate search results page based on role
    if (isAdmin) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`)
    } else if (isFaculty) {
      navigate(`/faculty/search?q=${encodeURIComponent(searchQuery)}`)
    } else if (isStudent) {
      navigate(`/student/search?q=${encodeURIComponent(searchQuery)}`)
    }
    setShowSuggestions(false)
    setIsSearchOpen(false)
  }

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false)
    setIsSearchOpen(false)
    setSearchQuery("")
    setDebouncedQuery("")
    
    if (item.type === "course") {
      if (isAdmin) {
        navigate(`/admin/courses/view/${item.id}`)
      } else if (isFaculty) {
        navigate(`/faculty/courses/view/${item.id}`)
      } else if (isStudent) {
        navigate(`/student/homepage/${item.id}/selected-course`)
      }
    } else if (item.type === "faculty" && isAdmin) {
      navigate(`/admin/faculty-management/view/${item.id}`)
    } else if (item.type === "student" && isAdmin) {
      navigate(`/admin/student-management/view/${item.id}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setDebouncedQuery("")
    setShowSuggestions(false)
    setIsSearchOpen(false)
  }

  const getInitials = (name) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const renderSuggestions = () => {
    if (!showSuggestions) return null

    const { courses = [], faculty = [], students = [], totalResults = 0 } = suggestions || {}
    const hasResults = totalResults > 0

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-200">
        {isSuggestionsLoading ? (
          <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Searching...</span>
          </div>
        ) : !hasResults ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No results found for <span className="font-medium">"{debouncedQuery}"</span>
          </div>
        ) : (
          <div className="max-h-[24rem] md:max-h-[32rem] overflow-y-auto scrollbar-hide">
            {/* Courses */}
            {courses.length > 0 && (
              <div className="border-b last:border-b-0">
                <div className="px-4 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  {isFaculty ? "MY COURSES" : "COURSES"}
                  <span className="ml-auto bg-background px-2 py-0.5 rounded-full text-[10px]">
                    {courses.length}
                  </span>
                </div>
                <div className="py-1">
                  {courses.slice(0, 3).map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => handleSuggestionClick(course)}
                      className="w-full px-4 py-3 hover:bg-accent/50 transition-colors flex items-center gap-3 text-left group"
                    >
                      {course.thumbnail && (
                        <div className="relative flex-shrink-0">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-12 h-12 object-cover rounded border group-hover:shadow-md transition-shadow"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {course.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {course.college && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              {course.college}
                            </Badge>
                          )}
                          {course.status === 'PUBLISHED' && (
                            <Badge className="text-[10px] px-1.5 py-0 h-4">Published</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Faculty - Only show for admins */}
            {isAdmin && faculty.length > 0 && (
              <div className="border-b last:border-b-0">
                <div className="px-4 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  FACULTY
                  <span className="ml-auto bg-background px-2 py-0.5 rounded-full text-[10px]">
                    {faculty.length}
                  </span>
                </div>
                <div className="py-1">
                  {faculty.slice(0, 3).map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleSuggestionClick(member)}
                      className="w-full px-4 py-3 hover:bg-accent/50 transition-colors flex items-center gap-3 text-left group"
                    >
                      <Avatar className="h-10 w-10 border group-hover:shadow-md transition-shadow flex-shrink-0">
                        <AvatarImage src={member.imageUrl} />
                        <AvatarFallback className="text-xs font-semibold">
                          {getInitials(member.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {member.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {member.emailAddress}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Students - Only show for admins */}
            {isAdmin && students.length > 0 && (
              <div className="border-b last:border-b-0">
                <div className="px-4 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5" />
                  STUDENTS
                  <span className="ml-auto bg-background px-2 py-0.5 rounded-full text-[10px]">
                    {students.length}
                  </span>
                </div>
                <div className="py-1">
                  {students.slice(0, 3).map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleSuggestionClick(student)}
                      className="w-full px-4 py-3 hover:bg-accent/50 transition-colors flex items-center gap-3 text-left group"
                    >
                      <Avatar className="h-10 w-10 border group-hover:shadow-md transition-shadow flex-shrink-0">
                        <AvatarImage src={student.imageUrl} />
                        <AvatarFallback className="text-xs font-semibold">
                          {getInitials(student.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {student.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {student.emailAddress}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View all results button */}
            {totalResults > 0 && (
              <div className="p-3 bg-muted border-t sticky bottom-0">
                <Button
                  type="button"
                  className="w-full shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => {
                    let searchPath = ""
                    if (isAdmin) {
                      searchPath = `/admin/search?q=${encodeURIComponent(searchQuery)}`
                    } else if (isFaculty) {
                      searchPath = `/faculty/search?q=${encodeURIComponent(searchQuery)}`
                    } else if (isStudent) {
                      searchPath = `/student/search?q=${encodeURIComponent(searchQuery)}`
                    }
                    navigate(searchPath)
                    setShowSuggestions(false)
                    setIsSearchOpen(false)
                  }}
                >
                  View all {totalResults} results →
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <header className={`fixed top-0 right-0 flex items-center justify-between py-4 px-4 md:py-5 md:px-6 lg:py-6 lg:px-8 z-[60] h-20 lg:left-64 transition-none ${isVideoPlayerOpen ? 'pointer-events-none' : ''} ${isSidebarOpen ? 'left-64' : 'left-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b'}`}>
      
      {/* Left side - Menu button and Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className={`lg:hidden ${isSidebarOpen ? 'hidden' : ''}`}
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        
        <h2 className={`text-lg md:text-2xl font-bold tracking-wide ${isSidebarOpen ? 'hidden lg:block' : 'block'}`}>WISE</h2>
      </div>
      
      {/* Search Bar - Desktop (For Admin, Faculty, and Students) */}
      {(isAdmin || isFaculty || isStudent) && (
        <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => debouncedQuery && setShowSuggestions(true)}
                placeholder={isStudent ? "Search courses..." : isFaculty ? "Search courses..." : "Search courses, faculty, students..."}
                className={`w-full pl-10 pr-10 ${isSidebarOpen ? 'border-border/50' : ''}`}
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
            {/* Suggestions dropdown */}
            {renderSuggestions()}
          </form>
        </div>
      )}

      {/* Right side - Mobile Search Toggle & User Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Mobile Search Button (For Admin, Faculty, and Students) */}
        {(isAdmin || isFaculty || isStudent) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden"
          >
            {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        )}
        
        <ThemeToggle />
        <UserButton />
      </div>

      {/* Mobile Search Bar - Overlay (For Admin, Faculty, and Students) */}
      {(isAdmin || isFaculty || isStudent) && isSearchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b shadow-lg z-40" ref={searchRef}>
          <div className="p-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => debouncedQuery && setShowSuggestions(true)}
                  placeholder={isStudent ? "Search courses..." : isFaculty ? "Search courses..." : "Search courses, faculty, students..."}
                  className={`w-full pl-10 pr-10 ${isSidebarOpen ? 'border-border/50' : ''}`}
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
              {/* Suggestions dropdown for mobile */}
              {renderSuggestions()}
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
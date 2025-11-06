import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, User, X, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAllFaculty } from "../../../hooks/analytics/adminAnalytics/useGetFaculty";

// Updated formatRelativeTime function to show "Active now"
const formatRelativeTime = (date) => {
  if (!date) return "Never";

  const now = new Date();
  const past = new Date(date);
  const diffInMs = now - past;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // Show "Active now" if last active within 2 minutes (user is currently logged in)
  if (diffInSeconds < 120) {
    return "Active now";
  } else if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? "1 minute ago"
      : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  } else if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
  } else if (diffInMonths < 12) {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  } else {
    return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
  }
};

// Live updating component with status indicator
const LiveRelativeTime = ({ date }) => {
  const [relativeTime, setRelativeTime] = useState(formatRelativeTime(date));
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const newTime = formatRelativeTime(date);
      setRelativeTime(newTime);
      setIsActive(newTime === "Active now");
    };

    // Update immediately
    updateTime();

    // Set up interval for updates every 30 seconds
    const interval = setInterval(updateTime, 30000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <span className="inline-flex items-center gap-2">
      {isActive && (
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      )}
      {relativeTime}
    </span>
  );
};

const FacultyManagement = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState("totalManagedCourses");
  const [sortOrder, setSortOrder] = useState("desc");
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // API call without search filter
  const { data, isLoading, error } = useGetAllFaculty(page, limit, "", sortBy, sortOrder);

  // Get all faculty for suggestions
  const { data: allFacultyData } = useGetAllFaculty(1, 1000, "", "fullName", "asc");

  const faculty = useMemo(() => data?.data || [], [data]);
  const total = data?.totalFaculty || 0;
  const totalPages = data?.totalPages || 1;

  // Filter suggestions based on search input
  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    
    const allFaculty = allFacultyData?.data || [];
    return allFaculty.filter(fac => 
      fac.fullName.toLowerCase().includes(search.toLowerCase()) ||
      fac.emailAddress.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
  }, [search, allFacultyData]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setSelectedFaculty(null);
    setShowSuggestions(true);
    setPage(1); // Reset to first page
  };

  const handleSortToggle = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc"); // default to desc
    }
    setPage(1); // Reset to first page on sort
  };

  const handleSuggestionClick = (fac) => {
    setSelectedFaculty(fac);
    setSearch(fac.fullName);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedFaculty(null);
    setShowSuggestions(false);
    setPage(1);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const hasActiveFilters = search || selectedFaculty;

  // Display filtered faculty
  const displayedFaculty = useMemo(() => {
    if (selectedFaculty) {
      return [selectedFaculty];
    }
    return faculty;
  }, [selectedFaculty, faculty]);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-0 sm:px-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Skeleton className="h-10 w-full sm:flex-1 max-w-sm" />
            <Skeleton className="h-10 w-full sm:w-[200px]" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-0 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Faculty Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage and view faculty members</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading faculty: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Sort Controls */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative w-full min-w-3xs" ref={searchRef}>
            <Input
              type="text"
              placeholder="Search faculty by name or email..."
              value={search}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="border-2 focus:border-primary transition-colors"
            />
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 z-50 max-h-60 sm:max-h-80 overflow-y-auto shadow-lg">
                <CardContent className="p-2">
                  {suggestions.map((fac) => (
                    <div
                      key={fac.id}
                      onClick={() => handleSuggestionClick(fac)}
                      className="flex items-center gap-3 p-2 sm:p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {fac.imageUrl ? (
                          <img 
                            src={fac.imageUrl} 
                            alt={fac.fullName} 
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" 
                          />
                        ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(fac.fullName)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{fac.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{fac.emailAddress}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleSortToggle("fullName")}
              className="flex items-center justify-center gap-2 border-2 text-sm"
            >
              <ArrowUpDown className="h-4 w-4" />
              A-Z {sortBy === "fullName" && (sortOrder === "asc" ? "↑" : "↓")}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors text-sm"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold py-2 sm:py-4 px-3 sm:px-6 min-w-[150px] sm:min-w-[200px] text-xs sm:text-sm">Faculty Name</TableHead>
              <TableHead className="font-semibold py-2 sm:py-4 px-3 sm:px-6 min-w-[150px] sm:min-w-[250px] text-xs sm:text-sm">Email Address</TableHead>
              <TableHead className="font-semibold py-2 sm:py-4 px-3 sm:px-6 text-center min-w-[100px] sm:min-w-[150px] text-xs sm:text-sm">
                <Button
                  variant="ghost"
                  onClick={() => handleSortToggle("totalManagedCourses")}
                  className="flex items-center gap-1 sm:gap-2 h-auto p-0 font-semibold mx-auto text-xs sm:text-sm"
                >
                  Courses
                  {sortBy === "totalManagedCourses" && (sortOrder === "asc" ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />)}
                </Button>
              </TableHead>
              <TableHead className="font-semibold py-2 sm:py-4 px-3 sm:px-6 text-center min-w-[100px] sm:min-w-[150px] text-xs sm:text-sm">
                <Button
                  variant="ghost"
                  onClick={() => handleSortToggle("lastActiveAt")}
                  className="flex items-center gap-1 sm:gap-2 h-auto p-0 font-semibold mx-auto text-xs sm:text-sm"
                >
                  Last Active
                  {sortBy === "lastActiveAt" && (sortOrder === "asc" ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />)}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedFaculty.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 sm:h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <User className="h-8 w-8 sm:h-12 sm:w-12 opacity-50 mb-2" />
                    <p className="font-medium text-sm sm:text-base">No faculty found</p>
                    <p className="text-xs sm:text-sm">Try adjusting your search</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayedFaculty.map((fac) => (
                <TableRow
                  key={fac.id}
                  className="border-b hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/faculty-management/view/${fac.id}`)}
                >
                  <TableCell className="py-2 sm:py-4 px-3 sm:px-6 min-w-[150px] sm:min-w-[200px]">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {fac.imageUrl ? (
                        <img 
                          src={fac.imageUrl} 
                          alt={fac.fullName} 
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0" 
                        />
                      ) : (
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {getInitials(fac.fullName)}
                        </div>
                      )}
                      <span className="font-medium text-sm sm:text-base">{fac.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 sm:py-4 px-3 sm:px-6 min-w-[150px] sm:min-w-[250px]">
                    <span className="text-xs sm:text-sm">{fac.emailAddress}</span>
                  </TableCell>
                  <TableCell className="py-2 sm:py-4 px-3 sm:px-6 text-center min-w-[100px] sm:min-w-[150px]">
                    <span className="text-xs sm:text-sm font-medium">
                      {fac.totalManagedCourses || 0}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 sm:py-4 px-3 sm:px-6 min-w-[100px] sm:min-w-[150px] text-center">
                    <LiveRelativeTime date={fac.lastActiveAt} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!selectedFaculty && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <div className="flex-1 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Showing {displayedFaculty.length} of {total} faculty
          </div>
          <div className="flex items-center space-x-2 sm:space-x-6 lg:space-x-8">
            <div className="flex items-center justify-center text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 bg-primary/10 rounded-lg">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 border-2"
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 border-2"
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;
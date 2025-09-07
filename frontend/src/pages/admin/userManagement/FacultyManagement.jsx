import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { useGetAllFaculty } from "../../../hooks/analytics/adminAnalytics/useGetFaculty";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const FacultyManagement = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const sortBy = "totalManagedCourses";
  const navigate = useNavigate();

  // Debounce search input
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, error } = useGetAllFaculty(page, limit, debouncedSearch, sortBy, sortOrder);

  const faculty = data?.data || [];
  const total = data?.totalFaculty || 0;
  const totalPages = data?.totalPages || 1;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setPage(1); // Reset to first page on sort
  };

  if(error) return (
    <div>Error: {error.message}</div>
  )

  return (
    <div className="space-y-6 px-2 min-h-screen">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearchChange}
          className="border rounded-lg px-3 py-2 w-full sm:w-64"
        />
        <button
          onClick={handleSortToggle}
          className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-primary transition-colors"
        >
          Sort by Total Courses {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <span className="text-lg font-medium">Loading...</span>
        </div>
      )}

      {/* Table Container */}
      {!isLoading && (
        <div className="bg-foreground/5 rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableCaption className="py-4">
                Showing {faculty.length} of {total} faculty
              </TableCaption>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="font-semibold py-4 px-6 text-left whitespace-nowrap">Profile</TableHead>
                  <TableHead className="font-semibold py-4 px-6 text-left whitespace-nowrap">Full Name</TableHead>
                  <TableHead className="font-semibold py-4 px-6 text-left whitespace-nowrap">Email Address</TableHead>
                  <TableHead className="font-semibold py-4 px-6 text-center whitespace-nowrap cursor-pointer" onClick={handleSortToggle}>
                    Total Courses {sortOrder === "asc" ? "↑" : "↓"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-lg font-medium">No faculty found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  faculty.map((fac) => (
                    <TableRow
                      key={fac.id}
                      className="border-b hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/faculty-management/view/${fac.id}`)}
                    >
                      <TableCell className="py-4 px-6 font-medium whitespace-nowrap">
                        <img src={fac.imageUrl} alt={fac.fullName} className="w-10 h-10 rounded-full object-cover" />
                      </TableCell>
                      <TableCell className="py-4 px-6 whitespace-nowrap">{fac.fullName}</TableCell>
                      <TableCell className="py-4 px-6 whitespace-nowrap">{fac.emailAddress}</TableCell>
                      <TableCell className="py-4 px-6 text-center whitespace-nowrap">{fac.totalManagedCourses}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="bg-foreground/5 rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-sm">
            Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * limit, total)}</span>{' '}
            of <span className="font-medium">{total}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === pageNum ? 'bg-blue-600 text-white' : 'text-foreground'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyManagement;
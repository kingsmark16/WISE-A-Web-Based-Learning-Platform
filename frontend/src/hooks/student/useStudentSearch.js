import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

const studentSearch = async (query, college = null) => {
  // If college filter is provided
  if (college && college.trim() !== "") {
    const response = await axiosInstance.get('/student/search', {
      params: { college, limit: 100 }
    });
    return response.data;
  }

  // If no query provided
  if (!query || query.trim() === "") {
    return {
      courses: [],
      totalResults: 0,
      query: ""
    };
  }

  // Regular search
  const response = await axiosInstance.get('/student/search', {
    params: { q: query, limit: 10 }
  });

  return response.data;
};

export const useStudentSearch = (searchQuery, college = null, options = {}) => {
  return useQuery({
    queryKey: ["student-search", searchQuery, college],
    queryFn: () => studentSearch(searchQuery, college),
    enabled: options.enabled !== undefined ? options.enabled : (searchQuery?.length > 0 || college?.length > 0),
    staleTime: 1000 * 60 * 0.5, // 30 seconds
    ...options
  });
};

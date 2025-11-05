import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

const studentSearch = async (query) => {
  if (!query || query.trim() === "") {
    return {
      courses: [],
      totalResults: 0,
      query: ""
    };
  }

  const response = await axiosInstance.get('/student/search', {
    params: { q: query, limit: 10 }
  });

  return response.data;
};

export const useStudentSearch = (searchQuery, options = {}) => {
  return useQuery({
    queryKey: ["student-search", searchQuery],
    queryFn: () => studentSearch(searchQuery),
    enabled: options.enabled !== undefined ? options.enabled : searchQuery?.length > 0,
    staleTime: 1000 * 60 * 0.5, // 30 seconds
    ...options
  });
};

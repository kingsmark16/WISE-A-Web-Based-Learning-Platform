import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

const facultySearch = async (query) => {
  if (!query || query.trim() === "") {
    return {
      courses: [],
      totalResults: 0,
      query: ""
    };
  }

  const response = await axiosInstance.get('/faculty/search', {
    params: { q: query, limit: 10 }
  });

  return response.data;
};

export const useFacultySearch = (searchQuery, options = {}) => {
  return useQuery({
    queryKey: ["faculty-search", searchQuery],
    queryFn: () => facultySearch(searchQuery),
    enabled: options.enabled !== undefined ? options.enabled : searchQuery?.length > 0,
    staleTime: 1000 * 60 * 0.5, // 30 seconds
    ...options
  });
};

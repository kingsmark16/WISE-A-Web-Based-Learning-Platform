import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

const adminSearch = async (query) => {
  if (!query || query.trim() === "") {
    return {
      courses: [],
      faculty: [],
      students: [],
      totalResults: 0,
      query: ""
    };
  }

  const response = await axiosInstance.get('/admin/search', {
    params: { q: query, limit: 10 }
  });

  return response.data;
};

export const useAdminSearch = (searchQuery, options = {}) => {
  return useQuery({
    queryKey: ["admin-search", searchQuery],
    queryFn: () => adminSearch(searchQuery),
    enabled: options.enabled !== undefined ? options.enabled : searchQuery?.length > 0,
    staleTime: 1000 * 60 * 0.5, // 30 seconds
    ...options
  });
};

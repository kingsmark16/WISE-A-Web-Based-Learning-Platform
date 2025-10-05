import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useSearchPosts = (courseId, searchQuery) => {
  return useQuery({
    queryKey: ["forum-posts-search", courseId, searchQuery],
    queryFn: async () => {
      if (!searchQuery?.trim()) return { items: [] };

      const params = new URLSearchParams();
      params.append("limit", "100"); // Get more results for search
      params.append("q", searchQuery);

      const response = await axiosInstance.get(
        `/course/${courseId}/forum/threads?${params.toString()}`
      );
      
      return response.data;
    },
    enabled: !!courseId && !!searchQuery?.trim(),
    staleTime: 10000, // 10 seconds
  });
};
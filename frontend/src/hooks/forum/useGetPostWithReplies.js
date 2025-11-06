import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useGetPostWithReplies = (postId, options = {}) => {
  return useQuery({
    queryKey: ["forum-post", postId],
    queryFn: async () => {
      if (!postId) return null;
      
      const response = await axiosInstance.get(`/course/forum/posts/${postId}?limit=5`);
      return response.data;
    },
    enabled: !!postId && (options.enabled ?? true),
    staleTime: 10000,
  });
};
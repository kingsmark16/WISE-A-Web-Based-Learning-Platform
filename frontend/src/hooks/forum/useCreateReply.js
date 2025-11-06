import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useCreateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }) => {
      const response = await axiosInstance.post(
        `/course/forum/posts/${postId}/replies`,
        { content }
      );
      return response.data;
    },
    onSuccess: () => {
      // Only invalidate posts list to update reply count
      // Don't invalidate forum-post as ViewPostDialog manages its own state
      queryClient.invalidateQueries({
        queryKey: ["forum-posts"],
      });
    },
  });
};
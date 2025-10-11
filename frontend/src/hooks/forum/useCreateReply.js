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
    onSuccess: (_, variables) => {
      // Invalidate the post to refresh replies
      queryClient.invalidateQueries({
        queryKey: ["forum-post", variables.postId],
      });
      
      // Invalidate posts list to update reply count
      queryClient.invalidateQueries({
        queryKey: ["forum-posts"],
      });
    },
  });
};
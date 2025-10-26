import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }) => {
      const response = await axiosInstance.post(
        `/course/forum/posts/${postId}/like`
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the posts list
      queryClient.invalidateQueries({
        queryKey: ["forum-posts"],
      });
      
      // Invalidate the specific post
      queryClient.invalidateQueries({
        queryKey: ["forum-post", variables.postId],
      });
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useLockPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, lock }) => {
      const endpoint = lock ? 'lock' : 'unlock';
      const response = await axiosInstance.post(
        `/course/forum/posts/${postId}/${endpoint}`
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

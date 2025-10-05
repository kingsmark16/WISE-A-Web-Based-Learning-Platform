import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useEditPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, title, content }) => {
      const response = await axiosInstance.patch(
        `/course/forum/posts/${postId}`,
        { title, content }
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
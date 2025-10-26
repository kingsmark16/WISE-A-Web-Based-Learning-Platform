import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useEditPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, title, content, category }) => {
      const response = await axiosInstance.patch(
        `/course/forum/posts/${postId}`,
        { title, content, category }
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

      // Invalidate categories to update counts
      queryClient.invalidateQueries({
        queryKey: ["forum-categories"],
      });
    },
  });
};
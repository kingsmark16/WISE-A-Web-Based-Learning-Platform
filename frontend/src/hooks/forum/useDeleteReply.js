import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useDeleteReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, replyId }) => {
      const response = await axiosInstance.delete(
        `/course/forum/posts/${postId}/replies/${replyId}`
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["forum-post", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
  });
};
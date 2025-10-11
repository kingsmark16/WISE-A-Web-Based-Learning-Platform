import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, title, content }) => {
      const response = await axiosInstance.post(
        `/course/${courseId}/forum/threads`,
        { title, content }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the posts list for this course
      queryClient.invalidateQueries({
        queryKey: ["forum-posts", variables.courseId],
      });
    },
  });
};
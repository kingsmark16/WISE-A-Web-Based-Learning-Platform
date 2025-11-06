import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useGetForumCategories = (courseId) => {
  return useQuery({
    queryKey: ["forum-categories", courseId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/course/${courseId}/forum/categories`);
      return response.data.data;
    },
    enabled: !!courseId,
  });
};
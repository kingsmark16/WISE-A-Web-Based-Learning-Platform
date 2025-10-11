import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export const useGetPostList = (courseId, { limit = 10, q } = {}) => {
  return useInfiniteQuery({
    queryKey: ["forum-posts", courseId, { limit, q }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.append("cursor", pageParam);
      if (limit) params.append("limit", limit.toString());
      if (q) params.append("q", q);

      const response = await axiosInstance.get(
        `/course/${courseId}/forum/threads?${params.toString()}`
      );

      console.log({ Data: response.data });

      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!courseId,
    staleTime: 30000, // 30 seconds
  });
};
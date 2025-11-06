import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const useTopCoursesByEngagement = (facultyId, timeRange = '1m') => {
  return useQuery({
    queryKey: ['topCourses', facultyId, timeRange],
    queryFn: async () => {
      if (!facultyId) return null;

      const response = await axiosInstance.get(
        `/faculty/${facultyId}/top-courses?timeRange=${timeRange}`
      );
      return response.data;
    },
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

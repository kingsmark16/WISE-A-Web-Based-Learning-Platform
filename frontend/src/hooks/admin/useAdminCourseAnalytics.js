import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const useAdminCourseAnalytics = (facultyId, courseId) => {
  return useQuery({
    queryKey: ['adminCourseAnalytics', facultyId, courseId],
    queryFn: async () => {
      if (!facultyId || !courseId) return null;

      const response = await axiosInstance.get(
        `/faculty/${facultyId}/courses/${courseId}/analytics`
      );
      return response.data;
    },
    enabled: !!facultyId && !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

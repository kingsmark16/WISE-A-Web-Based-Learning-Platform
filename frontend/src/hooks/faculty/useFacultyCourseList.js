import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const useFacultyCourseList = (facultyId) => {
  return useQuery({
    queryKey: ['facultyCourses', facultyId],
    queryFn: async () => {
      if (!facultyId) return null;

      const response = await axiosInstance.get(
        `/faculty/${facultyId}/courses`
      );
      return response.data.courses || [];
    },
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

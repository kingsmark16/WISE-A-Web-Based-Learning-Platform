import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export const useArchivedCourses = () => {
  return useQuery({
    queryKey: ['archived-courses'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/student/archived-courses');
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

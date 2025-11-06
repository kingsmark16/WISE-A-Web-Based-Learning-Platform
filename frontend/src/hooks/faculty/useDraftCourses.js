import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const useDraftCourses = () => {
  return useQuery({
    queryKey: ['draftCourses'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/faculty/draft-courses');
        console.log('Draft courses response:', response.data);
        return response.data.courses || [];
      } catch (error) {
        console.error('Error fetching draft courses:', error);
        throw error;
      }
    },
    staleTime: 0, // Data is immediately stale, forcing refetch
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

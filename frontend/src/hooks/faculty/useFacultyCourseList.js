import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const useFacultyCourseList = (facultyId) => {
  return useQuery({
    queryKey: ['facultyCourses', facultyId],
    queryFn: async () => {
      try {
        // Use authenticated endpoint without facultyId parameter
        const response = await axiosInstance.get('/faculty/courses');
        console.log('Faculty courses response:', response.data);
        return response.data.courses || [];
      } catch (error) {
        console.error('Error fetching faculty courses:', error);
        throw error;
      }
    },
    enabled: !!facultyId,
    staleTime: 0, // Data is immediately stale, forcing refetch
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

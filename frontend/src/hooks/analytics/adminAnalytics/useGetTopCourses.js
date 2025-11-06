import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

export const useGetTopCourses = () => {
  return useQuery({
    queryKey: ['topCourses'],
    queryFn: async () => {
      const response = await axiosInstance.get('/stats/top-courses');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

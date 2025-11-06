import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../lib/axios';

export const useGetTopStudentsByAchievements = () => {
  return useQuery({
    queryKey: ['topStudentsByAchievements'],
    queryFn: async () => {
      const response = await axiosInstance.get('/stats/students/top-finished');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

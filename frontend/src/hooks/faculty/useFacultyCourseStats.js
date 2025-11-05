import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const useFacultyCourseStats = (facultyId) => {
  return useQuery({
    queryKey: ['faculty-course-stats', facultyId],
    queryFn: async () => {
      if (!facultyId) throw new Error('Faculty ID is required');

      // Single optimized endpoint that fetches all stats
      const response = await axiosInstance.get(`/faculty/${facultyId}/stats`);

      return {
        total: response.data.stats.totalCourses,
        published: response.data.stats.publishedCourses,
        draft: response.data.stats.draftCourses,
        archived: response.data.stats.archivedCourses,
        modules: response.data.stats.totalModules,
        lessons: response.data.stats.totalLessons,
        quizzes: response.data.stats.totalQuizzes,
        enrolled: response.data.stats.totalEnrolled
      };
    },
    enabled: !!facultyId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};

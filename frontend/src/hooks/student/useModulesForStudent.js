import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const MODULES_QUERY_KEY = ['modules'];

// Fetch modules function
const fetchModules = async (courseId) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }
  const response = await axiosInstance.get(`/student/modules/${courseId}`);
  return response.data?.data || [];
};

/**
 * Hook to fetch course modules for students
 * Now includes locking status and completion status
 * @param {string} courseId - The ID of the course
 * @returns {Object} Query object with data, isLoading, error, and refetch
 */
export const useModulesForStudent = (courseId) => {
  return useQuery({
    queryKey: [...MODULES_QUERY_KEY, courseId],
    queryFn: () => fetchModules(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 1000 * 60, // Refetch every minute
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default useModulesForStudent;

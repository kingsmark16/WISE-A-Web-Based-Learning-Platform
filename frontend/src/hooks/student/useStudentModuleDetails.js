import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const MODULE_DETAILS_QUERY_KEY = 'student-module-details';

/**
 * Fetch module details for an enrolled student
 * Includes lessons, links, and quiz
 */
const fetchModuleDetails = async (courseId, moduleId) => {
  if (!courseId || !moduleId) {
    throw new Error('Both courseId and moduleId are required');
  }
  
  const response = await axiosInstance.get(
    `/student/module-details/${courseId}/${moduleId}`
  );
  return response.data?.data || null;
};

/**
 * Hook to fetch detailed module content for students
 * Optimized with lazy loading - only fetches when enabled
 * 
 * @param {string} courseId - The ID of the course
 * @param {string} moduleId - The ID of the module
 * @param {boolean} enabled - Whether to enable the query (e.g., when accordion is open)
 * @returns {Object} Query object with data, isLoading, error, and refetch
 * 
 * @example
 * const { data: module, isLoading, error } = useStudentModuleDetails(courseId, moduleId, isOpen);
 */
export const useStudentModuleDetails = (courseId, moduleId, enabled = true) => {
  return useQuery({
    queryKey: [MODULE_DETAILS_QUERY_KEY, courseId, moduleId],
    queryFn: () => fetchModuleDetails(courseId, moduleId),
    enabled: enabled && !!courseId && !!moduleId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export default useStudentModuleDetails;

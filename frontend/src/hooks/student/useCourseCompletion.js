import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const COURSE_COMPLETION_QUERY_KEY = (courseId) => ['course-completion', courseId];

/**
 * Fetch course completion status and certificate for a student
 */
const fetchCourseCompletion = async (courseId) => {
  try {
    const response = await axiosInstance.get(`/student/course-completion/${courseId}`);
    return response.data?.data || null;
  } catch (error) {
    // 404 means course not completed, return null
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Hook to fetch course completion status and certificate
 * Returns completion info if course is completed, null if not completed
 * 
 * @param {string} courseId - The course ID
 * @returns {Object} Query object with data (completion info), isLoading, error, and refetch
 * 
 * @example
 * const { data: completion, isLoading } = useCourseCompletion(courseId);
 * 
 * if (completion) {
 *   // Course is completed, show certificate
 * } else {
 *   // Course not completed, show locked message
 * }
 */
export const useCourseCompletion = (courseId) => {
  return useQuery({
    queryKey: COURSE_COMPLETION_QUERY_KEY(courseId),
    queryFn: () => fetchCourseCompletion(courseId),
    enabled: !!courseId,
    staleTime: 1000, // 1 second - allows quick re-fetches during polling but still caches briefly
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

/**
 * Hook to get the query key for course completion
 * Useful for manual invalidation
 */
export const getCourseCompletionQueryKey = (courseId) => {
  return COURSE_COMPLETION_QUERY_KEY(courseId);
};

export default useCourseCompletion;

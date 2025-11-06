import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

/**
 * Fetch overall course progress percentage for a student
 */
const fetchCourseProgress = async (courseId) => {
  try {
    const response = await axiosInstance.get(`/student/course-progress/${courseId}`);
    return response.data?.data || null;
  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Hook to fetch course progress (overall completion percentage)
 * Returns progress data including progressPercentage
 * 
 * @param {string} courseId - The course ID
 * @returns {Object} Query object with data (progress), isLoading, error
 * 
 * @example
 * const { data: progress } = useCourseProgress(courseId);
 * const completionPercentage = progress?.progressPercentage || 0;
 */
export const useCourseProgress = (courseId) => {
  return useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => fetchCourseProgress(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 30, // 30 seconds (frequent updates for progress bar)
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

export default useCourseProgress;

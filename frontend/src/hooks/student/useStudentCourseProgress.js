import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const COURSE_PROGRESS_QUERY_KEY = ['course-progress'];

/**
 * Fetch student's course progress
 */
const fetchCourseProgress = async (courseId) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }

  const response = await axiosInstance.get(`/student/course-progress/${courseId}`);
  return response.data?.data || null;
};

/**
 * Hook to fetch student's progress in a specific course
 * @param {string} courseId - The ID of the course
 * @returns {Object} Query object with data, isLoading, error, and refetch
 *
 * @example
 * const { data: progress, isLoading } = useStudentCourseProgress(courseId);
 * // progress: { progressPercentage, lessonsCompleted, quizzesCompleted, ... }
 */
export const useStudentCourseProgress = (courseId) => {
  return useQuery({
    queryKey: [...COURSE_PROGRESS_QUERY_KEY, courseId],
    queryFn: () => fetchCourseProgress(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 1000 * 60, // Refetch every minute
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default useStudentCourseProgress;
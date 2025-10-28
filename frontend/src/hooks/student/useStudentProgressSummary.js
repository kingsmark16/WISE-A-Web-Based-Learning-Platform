import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const PROGRESS_SUMMARY_QUERY_KEY = ['progress-summary'];

/**
 * Fetch student's progress summary across all enrolled courses
 */
const fetchProgressSummary = async () => {
  const response = await axiosInstance.get('/student/progress-summary');
  return response.data?.data || [];
};

/**
 * Hook to fetch student's progress summary for all enrolled courses
 * @returns {Object} Query object with data, isLoading, error, and refetch
 *
 * @example
 * const { data: progressSummary, isLoading } = useStudentProgressSummary();
 * // progressSummary: [{ courseId, courseTitle, progress: { progressPercentage, ... } }, ...]
 */
export const useStudentProgressSummary = () => {
  return useQuery({
    queryKey: PROGRESS_SUMMARY_QUERY_KEY,
    queryFn: fetchProgressSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default useStudentProgressSummary;
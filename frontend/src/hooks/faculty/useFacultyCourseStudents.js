import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const FACULTY_COURSE_STUDENTS_QUERY_KEY = (courseId) => ['faculty-course-students', courseId];

/**
 * Fetch all enrolled students in a course for faculty
 */
const fetchFacultyCourseStudents = async (courseId) => {
  if (!courseId) throw new Error('Course ID is required');
  const response = await axiosInstance.get(`/faculty/courses/${courseId}/students`);
  return response.data?.data || [];
};

/**
 * Hook to fetch all enrolled students in a course for faculty
 * Returns student information including progress and active status
 * 
 * @param {string} courseId - The ID of the course
 * @returns {Object} Query object with data, isLoading, error, and refetch
 *
 * @example
 * const { data: students, isLoading, refetch } = useFacultyCourseStudents(courseId);
 */
export const useFacultyCourseStudents = (courseId) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: FACULTY_COURSE_STUDENTS_QUERY_KEY(courseId),
    queryFn: () => fetchFacultyCourseStudents(courseId),
    enabled: !!courseId,
    staleTime: 0, // No caching - always consider data stale
    gcTime: 1000 * 60 * 30, // 30 minutes - keep data in cache
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds - very frequent updates
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    isLoading,
    error,
    refetch, // Expose refetch for manual updates
  };
};

export default useFacultyCourseStudents;

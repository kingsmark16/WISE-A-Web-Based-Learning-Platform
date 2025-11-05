import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const FACULTY_ENROLLED_STUDENTS_QUERY_KEY = (courseId) => ['faculty-enrolled-students', courseId];

/**
 * Fetch all enrolled students in a course for faculty
 */
const fetchFacultyEnrolledStudents = async (courseId) => {
  if (!courseId) throw new Error('Course ID is required');
  // The backend validates that the current user is the instructor via auth middleware
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
 * const { data: students, isLoading, refetch } = useFacultyEnrolledStudents(courseId);
 * 
 * // students: [
 * //   {
 * //     id: "student-id",
 * //     fullName: "John Doe",
 * //     imageUrl: "profile-url",
 * //     emailAddress: "john@example.com",
 * //     enrolledAt: "2025-11-02T10:30:00Z",
 * //     progress: {
 * //       percentage: 75,
 * //       lessonsCompleted: 15,
 * //       quizzesCompleted: 3
 * //     },
 * //     lastAccessedAt: "2025-11-02T14:30:00Z"
 * //   }
 * // ]
 * 
 * // Manually refetch data without full page reload
 * // refetch();
 */
export const useFacultyEnrolledStudents = (courseId) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: FACULTY_ENROLLED_STUDENTS_QUERY_KEY(courseId),
    queryFn: () => fetchFacultyEnrolledStudents(courseId),
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

export default useFacultyEnrolledStudents;

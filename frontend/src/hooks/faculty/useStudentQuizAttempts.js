import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

const STUDENT_QUIZ_ATTEMPTS_QUERY_KEY = (courseId, studentId) => ['student-quiz-attempts', courseId, studentId];

/**
 * Fetch all quiz attempts for a student in a course
 */
const fetchStudentQuizAttempts = async (courseId, studentId) => {
  if (!courseId || !studentId) throw new Error('Course ID and Student ID are required');
  const response = await axiosInstance.get(`/faculty/courses/${courseId}/students/${studentId}/quiz-attempts`);
  return response.data;
};

/**
 * Hook to fetch all quiz attempts for a student in a course
 * Returns quiz attempts with scores, dates, and results
 * 
 * @param {string} courseId - The ID of the course
 * @param {string} studentId - The ID of the student
 * @returns {Object} Query object with data, isLoading, error, and refetch
 *
 * @example
 * const { data, isLoading, error, refetch } = useStudentQuizAttempts(courseId, studentId);
 */
export const useStudentQuizAttempts = (courseId, studentId) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: STUDENT_QUIZ_ATTEMPTS_QUERY_KEY(courseId, studentId),
    queryFn: () => fetchStudentQuizAttempts(courseId, studentId),
    enabled: !!courseId && !!studentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    isLoading,
    error,
    refetch
  };
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";

const FACULTY_COURSE_STUDENTS_QUERY_KEY = (courseId) => ['faculty-course-students', courseId];

/**
 * Fetch all enrolled students in a course for faculty
 */
const fetchFacultyCourseStudents = async (courseId) => {
  if (!courseId) throw new Error('Course ID is required');
  const response = await axiosInstance.get(`/faculty/courses/${courseId}/students`);
  return response.data?.data || [];
};


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


export const useRemoveStudentFromCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courseId, studentId }) => {
      const response = await axiosInstance.delete(`/faculty/courses/${courseId}/students/${studentId}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Student removed from course successfully');
      // Invalidate the students list to refetch
      queryClient.invalidateQueries({ 
        queryKey: FACULTY_COURSE_STUDENTS_QUERY_KEY(variables.courseId) 
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Failed to remove student from course';
      toast.error(errorMessage);
    }
  });
};

export default useFacultyCourseStudents;

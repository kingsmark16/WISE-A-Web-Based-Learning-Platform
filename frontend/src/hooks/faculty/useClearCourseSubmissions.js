import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";

/**
 * Clear all quiz submissions for all enrolled students in a course
 */
const clearCourseSubmissions = async (courseId) => {
  if (!courseId) throw new Error('Course ID is required');
  const response = await axiosInstance.delete(`/faculty/courses/${courseId}/clear-submissions`);
  return response.data;
};

/**
 * Clear all quiz submissions for a specific student in a course
 */
const clearStudentSubmissions = async ({ courseId, studentId }) => {
  if (!courseId) throw new Error('Course ID is required');
  if (!studentId) throw new Error('Student ID is required');
  const response = await axiosInstance.delete(`/faculty/courses/${courseId}/students/${studentId}/clear-submissions`);
  return response.data;
};

/**
 * Hook to clear all quiz submissions for all enrolled students in a course
 * 
 * @returns {Object} Mutation object with mutate, isLoading, error
 *
 * @example
 * const { mutate: clearSubmissions, isLoading } = useClearCourseSubmissions();
 * clearSubmissions(courseId);
 */
export const useClearCourseSubmissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCourseSubmissions,
    onSuccess: (data, courseId) => {
      // Invalidate faculty course students query to refresh the list
      queryClient.invalidateQueries(['faculty-course-students', courseId]);
      
      // Show success message with details
      const message = data.message || 
        `Successfully cleared ${data.deletedCount} submission(s) for ${data.affectedStudents} student(s)`;
      
      toast.success(message, {
        autoClose: 5000
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 
        error?.message || 
        'Failed to clear submissions';
      
      toast.error(errorMessage);
    }
  });
};

/**
 * Hook to clear all quiz submissions for a specific student in a course
 * 
 * @returns {Object} Mutation object with mutate, isLoading, error
 *
 * @example
 * const { mutate: clearStudentSubmissions, isLoading } = useClearStudentSubmissions();
 * clearStudentSubmissions({ courseId, studentId });
 */
export const useClearStudentSubmissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearStudentSubmissions,
    onSuccess: (data, variables) => {
      // Invalidate faculty course students query to refresh the list
      queryClient.invalidateQueries(['faculty-course-students', variables.courseId]);
      
      // Show success message with details
      const message = data.message || 
        `Successfully cleared ${data.deletedCount} submission(s) for ${data.studentName}`;
      
      toast.success(message, {
        autoClose: 5000
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 
        error?.message || 
        'Failed to clear student submissions';
      
      toast.error(errorMessage);
    }
  });
};

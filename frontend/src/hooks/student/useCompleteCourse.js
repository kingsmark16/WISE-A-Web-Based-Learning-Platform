import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

/**
 * Call the certificate generation endpoint
 */
const completeCourse = async (courseId) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }

  const response = await axiosInstance.post(`/completions/courses/${courseId}/complete`);
  return response.data;
};

/**
 * Hook to complete a course and generate certificate
 * Automatically invalidates course completion queries to show certificate
 * 
 * @returns {Object} Mutation object with mutate, isLoading, error, etc.
 * 
 * @example
 * const { mutate: completeCourse, isPending } = useCompleteCourse();
 * 
 * const handleComplete = () => {
 *   completeCourse(courseId, {
 *     onSuccess: (data) => {
 *       console.log('Course completed!', data);
 *       toast.success('Certificate generated successfully!');
 *     },
 *     onError: (error) => {
 *       toast.error('Failed to generate certificate');
 *     }
 *   });
 * };
 */
export const useCompleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeCourse,
    onSuccess: () => {
      // Don't invalidate immediately - let polling handle the updates
      // This allows the request to return quickly (certificate generates in background)
      
      // Invalidate enrolled courses in case progress changed
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
    },
    onError: (error) => {
      console.error('Failed to complete course:', error);
    },
    retry: 1,
  });
};

export default useCompleteCourse;

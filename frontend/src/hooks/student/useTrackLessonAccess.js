import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const LESSON_ACCESS_QUERY_KEY = ['lesson-access'];
const MODULES_QUERY_KEY = ['modules'];
const COURSE_PROGRESS_QUERY_KEY = ['course-progress'];
const MODULE_DETAILS_QUERY_KEY = 'student-module-details';

/**
 * Track lesson access - automatically marks lesson as completed
 */
const trackLessonAccess = async (lessonId) => {
  if (!lessonId) {
    throw new Error('Lesson ID is required');
  }

  const response = await axiosInstance.post('/student/lesson-access', {
    lessonId
  });

  return response.data;
};

/**
 * Hook to track lesson access and update progress
 * Automatically invalidates related queries to refresh progress
 *
 * @param {string} courseId - The course ID (optional, for specific invalidation)
 * @param {string} moduleId - The module ID (optional, for specific invalidation)
 * @returns {Object} Mutation object with mutate, isLoading, error, etc.
 *
 * @example
 * const trackAccess = useTrackLessonAccess();
 *
 * // Track when user clicks on a lesson
 * const handleLessonClick = (lessonId) => {
 *   trackAccess.mutate(lessonId, {
 *     onSuccess: () => {
 *       console.log('Lesson access tracked successfully');
 *     },
 *     onError: (error) => {
 *       if (error.response?.status === 403 && error.response?.data?.isLocked) {
 *         alert('Complete the previous module first!');
 *       }
 *     }
 *   });
 * };
 */
export const useTrackLessonAccess = (courseId = null, moduleId = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trackLessonAccess,
    onSuccess: () => {

      // Invalidate related queries to refresh progress
      queryClient.invalidateQueries({ queryKey: LESSON_ACCESS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY }); // This invalidates ['modules', courseId] queries
      queryClient.invalidateQueries({ queryKey: COURSE_PROGRESS_QUERY_KEY });

      // Invalidate specific module details if courseId and moduleId provided
      if (courseId && moduleId) {
        queryClient.invalidateQueries({
          queryKey: ['student-module-details', courseId, moduleId],
          exact: true
        });
      }

      // You could also optimistically update the cache here if needed
    },
    onError: (error) => {
      console.error('Failed to track lesson access:', error);
    },
    retry: 1,
  });
};

export default useTrackLessonAccess;
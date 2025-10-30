import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const ENROLLED_COURSES_QUERY_KEY = ['enrolled-courses'];

/**
 * Fetch student's enrolled courses
 */
const fetchEnrolledCourses = async () => {
  const response = await axiosInstance.get('/student/enrolled-courses');
  return response.data?.data || [];
};

/**
 * Hook to fetch all courses a student is enrolled in
 * Returns comprehensive course information including progress
 * 
 * @returns {Object} Query object with data, isLoading, error, and refetch
 *
 * @example
 * const { data: courses, isLoading } = useEnrolledCourses();
 * 
 * // courses: [
 * //   {
 * //     id: "course-id",
 * //     title: "Course Title",
 * //     description: "Course description",
 * //     thumbnail: "image-url",
 * //     category: "Technology",
 * //     managedBy: { fullName: "Faculty Name", imageUrl: "url" },
 * //     totalEnrollments: 150,
 * //     totalModules: 5,
 * //     totalLessons: 25,
 * //     enrolledAt: "2025-10-28T10:00:00Z",
 * //     progress: {
 * //       percentage: 75,
 * //       lessonsCompleted: 18,
 * //       quizzesCompleted: 3,
 * //       lastAccessedAt: "2025-10-28T09:30:00Z"
 * //     }
 * //   }
 * // ]
 */
export const useEnrolledCourses = () => {
  return useQuery({
    queryKey: ENROLLED_COURSES_QUERY_KEY,
    queryFn: fetchEnrolledCourses,
    staleTime: 1000 * 5, // 5 seconds - very fast updates
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 15, // Refetch every 15 seconds - more frequent
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default useEnrolledCourses;

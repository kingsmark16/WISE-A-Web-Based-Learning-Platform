import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const STUDENT_CERTIFICATES_QUERY_KEY = ['student-certificates'];

/**
 * Fetch all certificates for the logged-in student
 */
const fetchStudentCertificates = async () => {
  const response = await axiosInstance.get('/student/certificates');
  return response.data?.data || [];
};

/**
 * Hook to fetch all student certificates
 * Returns array of certificates with course details
 * 
 * @returns {Object} Query object with data, isLoading, error, and refetch
 *
 * @example
 * const { data: certificates, isLoading } = useStudentCertificates();
 * 
 * // certificates: [
 * //   {
 * //     id: "cert-id",
 * //     courseId: "course-id",
 * //     courseTitle: "Course Title",
 * //     courseThumbnail: "image-url",
 * //     college: "College Name",
 * //     instructor: "Faculty Name",
 * //     instructorImage: "faculty-image-url",
 * //     certificateNumber: "CERT-123456",
 * //     certificateUrl: "certificate-pdf-url",
 * //     issuedAt: "2025-11-02T10:30:00Z",
 * //     completedAt: "2025-11-02T10:30:00Z"
 * //   }
 * // ]
 */
export const useStudentCertificates = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: STUDENT_CERTIFICATES_QUERY_KEY,
    queryFn: fetchStudentCertificates,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};

export default useStudentCertificates;

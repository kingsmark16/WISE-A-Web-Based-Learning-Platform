import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export const useGetCourses = ({ page = 1, limit = 12, search = '', status = 'all', college = 'all' } = {}) => {
    return useQuery({
        queryKey: ['courses', page, limit, search, status, college],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
                status,
                college
            });
            
            const response = await axiosInstance.get(`/course?${params.toString()}`);
            return response.data;
        },
        keepPreviousData: true, // Keep previous data while fetching new page
        staleTime: 0, // Data is immediately stale, forcing refetch on invalidation
    })
}


export const useCreateCourse = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseData) => {
            const response = await axiosInstance.post('/course', courseData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        },
        onSuccess: async () => {
            // Clear all course cache
            queryClient.removeQueries({
                queryKey: ['courses'],
                exact: false
            });
            
            // Clear draft courses cache completely so fresh data is fetched
            queryClient.removeQueries({
                queryKey: ['draftCourses']
            });
            
            // Clear faculty courses cache (all faculty courses)
            queryClient.removeQueries({
                queryKey: ['facultyCourses'],
                exact: false
            });
            
            // Pre-fetch the first page with default filters for admin courses
            await queryClient.prefetchQuery({
                queryKey: ['courses', 1, 12, '', 'all', 'all'],
                queryFn: async () => {
                    const response = await axiosInstance.get('/course?page=1&limit=12&search=&status=all&category=all');
                    return response.data;
                },
                staleTime: 0
            });
            
            toast.success('Course created successfully!');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || 'Failed to create course';
            toast.error(errorMessage);
        }
    })
}


export const useArchiveCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.patch(`/course/${id}/archive`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['courses']);
            toast.success('Course archived successfully!');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || 'Failed to archive course';
            toast.error(errorMessage);
        }
    })
}


export const useGetCourse = (id) => {
 

    return useQuery({
        queryKey: ['course', id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/course/${id}`);
            return response.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 60,
    })
}


export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async ({id, courseData}) => {
            const response = await axiosInstance.patch(`/course/${id}`, courseData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['courses']);
            queryClient.invalidateQueries(['course']);
            toast.success('Course updated successfully!');
            navigate('/admin/courses');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || 'Failed to update course';
            toast.error(errorMessage);
        }
    })
}

export const usePublishCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, status}) => {
            const response = await axiosInstance.patch(`/course/${id}/publish`, {status}, {
                headers: {'Content-Type': 'application/json'}
            });

            return response.data;
        },
        onMutate: async ({id, status}) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['course', id] })
            await queryClient.cancelQueries({ queryKey: ['courses'] })
            
            // Snapshot the previous values
            const previousCourse = queryClient.getQueryData(['course', id])
            const previousCourses = queryClient.getQueryData(['courses'])
            
            // Optimistically update the course cache
            queryClient.setQueryData(['course', id], (old) => {
                if (!old?.course) return old
                return {
                    ...old,
                    course: {
                        ...old.course,
                        status: status
                    }
                }
            })
            
            // Also optimistically update courses list
            queryClient.setQueryData(['courses'], (old) => {
                if (!old?.courses || !Array.isArray(old.courses)) return old
                return {
                    ...old,
                    courses: old.courses.map((course) => 
                        course.id === id 
                            ? { ...course, status }
                            : course
                    )
                }
            })
            
            return { previousCourse, previousCourses }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
            queryClient.invalidateQueries({ queryKey: ['course'] })
            const message = data.course.status === 'PUBLISHED'
                ? 'Course published successfully!' 
                : data.course.status === 'DRAFT'
                ? 'Course changed to draft successfully!'
                : 'Course archived successfully!';
            toast.success(message);
        },
        onError: (error, {id}, context) => {
            // Rollback on error
            if (context?.previousCourse) {
                queryClient.setQueryData(['course', id], context.previousCourse)
            }
            if (context?.previousCourses) {
                queryClient.setQueryData(['courses'], context.previousCourses)
            }
            const errorMessage = error?.response?.data?.message || 'Failed to update course status';
            toast.error(errorMessage);
        }
    })
}


export const useGetFeaturedCourses = () => {
    return useQuery({
        queryKey: ['featured-courses'],
        queryFn: async () => {
            const response = await axiosInstance.get('/student/featured-courses');

            return response.data;
        },
        refetchOnWindowFocus: true,
        staleTime: 1000 * 60 * 1  // 1 minute for faster updates
    })
}

export const useGetSelectedCourse = (id) => {
    return useQuery({
        queryKey: ['selected-course', id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/student/selected-course/${id}`);
            return response.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5
    })
}

export const useGetPopularCourses = () => {
    return useQuery({
        queryKey: ['popular-courses'],
        queryFn: async () => {
            const response = await axiosInstance.get('/student/featured-courses');
            return response.data;
        },
        refetchOnWindowFocus: true,
        staleTime: 1000 * 60 * 1  // 1 minute for faster updates
    })
}

export const useGetRecommendedCourses = () => {
    return useQuery({
        queryKey: ['recommended-courses'],
        queryFn: async () => {
            const response = await axiosInstance.get('/student/featured-courses');
            return response.data;
        },
        refetchOnWindowFocus: true,
        staleTime: 1000 * 60 * 1  // 1 minute for faster updates
    })
}


export const useEnrollInCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({courseId, courseCode}) => {
            const response = await axiosInstance.post('/student/enroll', {courseId, courseCode});

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
            toast.success('Successfully enrolled in course!');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || 'Failed to enroll in course';
            toast.error(errorMessage);
        }

    })
}

export const useUnenrollInCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseId) => {
            const response = await axiosInstance.post('/student/unenroll', {courseId});

            return response.data;
        },
        onMutate: async (courseId) => {
            // Cancel any outgoing refetches for enrollment status
            await queryClient.cancelQueries({ queryKey: ['enrollmet-status', courseId] });

            // Snapshot the previous enrollment status
            const previousEnrollmentStatus = queryClient.getQueryData(['enrollmet-status', courseId]);

            // Optimistically update the enrollment status to not enrolled
            queryClient.setQueryData(['enrollmet-status', courseId], {
                isEnrolled: false,
                enrollmentDate: null
            });

            return { previousEnrollmentStatus };
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
            toast.success('Successfully unenrolled from course!');
        },
        onError: (error, courseId, context) => {
            // Rollback on error
            if (context?.previousEnrollmentStatus) {
                queryClient.setQueryData(['enrollmet-status', courseId], context.previousEnrollmentStatus);
            }
            const errorMessage = error?.response?.data?.message || 'Failed to unenroll from course';
            toast.error(errorMessage);
        }

    })
}

export const useCheckEnrollmentStatus = (courseId) => {
    return useQuery({
        queryKey: ['enrollmet-status', courseId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/student/enrollment-status/${courseId}`);

            return response.data;
        },
        enabled: !!courseId
    })
}
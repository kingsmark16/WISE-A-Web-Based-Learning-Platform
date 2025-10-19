import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export const useGetCourses = ({ page = 1, limit = 12, search = '', status = 'all', category = 'all' } = {}) => {
    return useQuery({
        queryKey: ['courses', page, limit, search, status, category],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
                status,
                category
            });
            
            const response = await axiosInstance.get(`/course?${params.toString()}`);
            return response.data;
        },
        keepPreviousData: true, // Keep previous data while fetching new page
        staleTime: 1000 * 60 * 5,
    })
}


export const useCreateCourse = () => {

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (courseData) => {
            const response = await axiosInstance.post('/course', courseData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['courses']);
            toast.success('Course created successfully!');
            navigate('/admin/courses');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || 'Failed to create course';
            toast.error(errorMessage);
        }
    })
}


export const useDeleteCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/course/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['courses']);
            toast.success('Course deleted successfully!');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || 'Failed to delete course';
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
        mutationFn: async ({id, isPublished}) => {
            const response = await axiosInstance.patch(`/course/${id}/publish`, {isPublished}, {
                headers: {'Content-Type': 'application/json'}
            });

            return response.data;
        },
        onMutate: async ({id, isPublished}) => {
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
                        isPublished: isPublished
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
                            ? { ...course, isPublished }
                            : course
                    )
                }
            })
            
            return { previousCourse, previousCourses }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
            queryClient.invalidateQueries({ queryKey: ['course'] })
            const message = data.course.isPublished 
                ? 'Course published successfully!' 
                : 'Course unpublished successfully!';
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
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5
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


export const useEnrollInCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseId) => {
            const response = await axiosInstance.post('/student/enroll', {courseId});

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
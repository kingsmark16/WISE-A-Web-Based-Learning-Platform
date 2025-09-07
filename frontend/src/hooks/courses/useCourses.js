import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios";
import toast from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

export const useGetCourses = () => {

    return useQuery({
       
        queryKey: ['courses'],
        queryFn: async () => {
            const response = await axiosInstance.get('/course');
            return response.data;
        },
        staleTime: 1000 * 60 * 60,
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
            navigate('/admin/courses');
        }
    })
}


export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/course/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['courses']);
            navigate('/admin/courses');
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
            navigate('/admin/courses');
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
        onSuccess: () => {
            queryClient.invalidateQueries(['courses']);
            queryClient.invalidateQueries(['course']);
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
            toast.success('Successfully enrolled in course');
        },
        onError: (error) => {
            toast.error(error.message);
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
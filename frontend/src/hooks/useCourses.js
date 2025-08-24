import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";

export const useGetCourses = () => {

    return useQuery({
       
        queryKey: ['courses'],
        queryFn: async () => {
            const response = await axiosInstance.get('/course');
            return response.data;
        },
        staleTime: 1000 * 60 * 60, // 5 minutes
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
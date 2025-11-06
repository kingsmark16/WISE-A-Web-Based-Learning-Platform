import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"

export const useGetCoursesByCategory = () => {
    
    return useQuery({
        queryKey: ['courseByCategory'],
        queryFn: async () => {
            const response = await axiosInstance.get('/');
            return response.data;
        },
        staleTime: 1000 * 60 * 5

    })
}

export const useGetRandomPublishedCourses = () => {
    return useQuery({
        queryKey: ['randomPublishedCourses'],
        queryFn: async () => {
            const response = await axiosInstance.get('/courses/random?limit=6');
            return response.data;
        },
        staleTime: 1000 * 60 * 10 // 10 minutes
    })
}
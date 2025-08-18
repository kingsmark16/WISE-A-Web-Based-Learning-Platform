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
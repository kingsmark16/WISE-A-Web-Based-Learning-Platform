import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "../../../lib/axios"

export const useGetCourseTotal = () => {
    return useQuery({
        queryKey: ['total-courses'],
        queryFn: async () => {
            const response = await axiosInstance.get('/stats/total');
            return response.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 1024 * 60 * 5
        
    })
}
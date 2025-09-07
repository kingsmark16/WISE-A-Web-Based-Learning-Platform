import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"

export const useGetCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await axiosInstance.get('/student/categories');

            return response.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5
    })
}
import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"


export const useGetFacultyId = () => {
    return useQuery({
        queryKey: ['faculty-name'],
        queryFn: async () => {
            const response = await axiosInstance.get('/faculty');
            return response.data;
        },
        staleTime: 1000 * 60 * 60

    })
}
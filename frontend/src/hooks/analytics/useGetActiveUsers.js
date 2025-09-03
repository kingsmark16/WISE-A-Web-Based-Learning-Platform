import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios"

const fetchActiveUsers = async () => {
    const response = await axiosInstance.get('/stats/active-users');
    return response.data;
}

export const useGetActiveUsers = () => {
    return useQuery({
        queryKey: ['activeUsers'],
        queryFn: fetchActiveUsers,
        refetchOnWindowFocus: false
        
    })
}
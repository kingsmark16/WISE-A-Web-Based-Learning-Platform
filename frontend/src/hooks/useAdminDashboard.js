import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"

export const useAdminDashboard = () => {
    return useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            const response = await axiosInstance.get('/admin/dashboard');
            return response.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 60
    })
}
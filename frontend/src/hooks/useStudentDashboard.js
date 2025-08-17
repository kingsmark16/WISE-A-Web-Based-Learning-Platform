import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"

export const useStudentDashboard = () => {
    return useQuery({
        queryKey: ['student-dashboard'],
        queryFn: async () => {
            const response = await axiosInstance.get('/student/dashboard');
            return response.data;
        },
        refetchOnWindowFocus: false
    })
}
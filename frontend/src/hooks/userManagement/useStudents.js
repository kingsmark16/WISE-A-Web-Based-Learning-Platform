import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios"

export const useGetStudents = (page = 1, limit = 10, search = "", sortBy = "fullName", sortOrder = "asc") => {
    return useQuery({
        queryKey: ['all-students', page, limit, search, sortBy, sortOrder],
        queryFn: async () => {
            const response = await axiosInstance.get('/admin/display-students', {
                params: { page, limit, search, sortBy, sortOrder }
            });
            return response.data;
        },
        staleTime: 1000 * 60 * 10
    })
}

export const useGetSingleStudent = (id) => {
    return useQuery({
        queryKey: ['single-student', id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/admin/display-students/${id}`)
            return response.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5 
    })
}
import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "../../../lib/axios"


export const useGetFacultyId = () => {
    return useQuery({
        queryKey: ['faculty-name'],
        queryFn: async () => {
            const response = await axiosInstance.get('/admin/facname');
            return response.data;
        },
        staleTime: 1000 * 60 * 10

    })
}

export const useGetAllFaculty = (page = 1, limit = 10, search = "", sortBy = "fullName", sortOrder = "asc") => {
    return useQuery({
        queryKey: ['all-faculty', page, limit, search, sortBy, sortOrder],
        queryFn: async () => {
            const response = await axiosInstance.get('/admin/display-faculty', {
                params: { page, limit, search, sortBy, sortOrder }
            });
            return response.data;
        },
        staleTime: 1000 * 60 * 10
    })
}

export const useGetSingleFaculty = (id) => {
    return useQuery({
        queryKey: ['single-faculty', id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/admin/display-faculty/${id}`)
            return response.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5 
    })
}
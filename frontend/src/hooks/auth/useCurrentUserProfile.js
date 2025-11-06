import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

export const useCurrentUserProfile = () => {
    return useQuery({
        queryKey: ['current-user-profile'],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get('/auth/profile');
                console.log('Profile fetch successful:', response.data);
                return response.data;
            } catch (error) {
                console.error('Profile fetch failed:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes cache
        retry: 2
    });
};

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import axiosInstance from "../lib/axios";

export const useGetDbUser = () => {
  const { user: clerkUser } = useUser();

  return useQuery({
    queryKey: ["db-user", clerkUser?.id],
    queryFn: async () => {
      if (!clerkUser?.id) return null;
      
      const response = await axiosInstance.get("/user/me");
      return response.data;
    },
    enabled: !!clerkUser?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
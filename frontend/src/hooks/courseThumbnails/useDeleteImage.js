import { useMutation } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios"

export const useDeleteImage = () => {
    return useMutation({
        mutationFn: async ({publicId}) => {
            const response = await axiosInstance.delete('/upload/image', {
                data: {publicId}
            });

            return response.data;
        }
    })
}
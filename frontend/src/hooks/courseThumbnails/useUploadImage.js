import { useMutation } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios";

export const useUploadImage = () => {
    return useMutation({
        mutationFn: async ({file, previousPublicId}) => {
            const formData = new FormData();
            formData.append('image', file);

            if(previousPublicId) {
                formData.append('previousPublicId', previousPublicId);
            }

            const response = await axiosInstance.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        }
    });
};
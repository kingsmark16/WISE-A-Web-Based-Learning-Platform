import { useMutation } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"

export const useDeleteLesson = () => {
    return useMutation({
        mutationFn: async ({lessonId, deleteFromYoutube = true}) => {
            const response = await axiosInstance.delete(`youtube-lessons/${lessonId}?deleteFromYoutube=${deleteFromYoutube}`);

            return response.data;
        }
    })
}
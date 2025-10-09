import { useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"

// keep delete hook as-is
export const useDeleteLesson = () => {
    return useMutation({
        mutationFn: async ({lessonId, deleteFromYoutube = true}) => {
            const response = await axiosInstance.delete(`youtube-lessons/${lessonId}?deleteFromYoutube=${deleteFromYoutube}`);
            return response.data;
        }
    })
}

// Optimized reorder hook with optimistic UI
export const useReorderLessons = (moduleId) => {
    const queryClient = useQueryClient();
    const queryKey = ['module', moduleId];

    return useMutation({
        mutationFn: async ({ orderedLessons }) => {
            // orderedLessons: [{ id: string, position: number }, ...]
            const response = await axiosInstance.post(`course/modules/${moduleId}/lessons/reorder`, { orderedLessons });
            return response.data;
        },
        onMutate: async ({ orderedLessons }) => {
            if (!moduleId) return;
            await queryClient.cancelQueries(queryKey);
            const previous = queryClient.getQueryData(queryKey);

            // optimistic update: if we have module data with lessons array, reorder them locally
            if (previous?.module?.lessons) {
                const idToPos = new Map(orderedLessons.map(l => [l.id, l.position]));
                const optimistic = {
                    ...previous,
                    module: {
                        ...previous.module,
                        lessons: [...previous.module.lessons]
                            .map(l => ({ ...l, position: idToPos.has(l.id) ? idToPos.get(l.id) : l.position }))
                            .sort((a, b) => a.position - b.position)
                    }
                };
                queryClient.setQueryData(queryKey, optimistic);
            }

            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
        },
        onSettled: () => {
            if (!moduleId) return;
            queryClient.invalidateQueries(queryKey);
        }
    })
}

// Optimized reorder hook for links with optimistic UI
export const useReorderLinks = (moduleId) => {
    const queryClient = useQueryClient();
    const queryKey = ['module', moduleId];

    return useMutation({
        mutationFn: async ({ orderedLinks }) => {
            // orderedLinks: [{ id: string, position: number }, ...]
            const response = await axiosInstance.post(`link/module/${moduleId}/reorder`, { orderedLinks });
            return response.data;
        },
        onMutate: async ({ orderedLinks }) => {
            if (!moduleId) return;
            await queryClient.cancelQueries(queryKey);
            const previous = queryClient.getQueryData(queryKey);

            // optimistic update: if we have module data with links array, reorder them locally
            if (previous?.module?.links) {
                const idToPos = new Map(orderedLinks.map(l => [l.id, l.position]));
                const optimistic = {
                    ...previous,
                    module: {
                        ...previous.module,
                        links: [...previous.module.links]
                            .map(l => ({ ...l, position: idToPos.has(l.id) ? idToPos.get(l.id) : l.position }))
                            .sort((a, b) => a.position - b.position)
                    }
                };
                queryClient.setQueryData(queryKey, optimistic);
            }

            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
        },
        onSettled: () => {
            if (!moduleId) return;
            queryClient.invalidateQueries(queryKey);
        }
    })
}
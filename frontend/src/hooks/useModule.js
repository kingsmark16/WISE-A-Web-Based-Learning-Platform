import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"

export const useCreateMdodule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ title, description, courseId }) => {
            const response = await axiosInstance.post('/course/modules', { title, description, courseId }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['modules']);
        }
    })
}

export const useGetModules = (courseId) => {
    return useQuery({
        queryKey: ['modules', courseId],
        queryFn: async () => {
            const response = await axiosInstance.get('/course/modules', {
                params: {
                    courseId
                }
            });
            return response.data;
        }
    })
}

// new: get single module with lessons and quizzes
export const useGetModule = (moduleId, enabled = true) => {
    return useQuery({
        queryKey: ['module', moduleId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/course/module/${moduleId}`);
            return response.data;
        },
        enabled: enabled && !!moduleId,
        staleTime: 5 * 60 * 1000, // 5 minutes - keeps cache fresh after optimistic updates
    });
};

// updated: accept courseId and perform optimistic UI with rollback
export const useReorderModules = (courseId) => {
    const queryClient = useQueryClient();

    const queryKey = ['modules', courseId];

    return useMutation({
        mutationFn: async (orderedModules /* [{id, position}] */) => {
            // call bulk reorder endpoint
            const response = await axiosInstance.patch('/course/modules/reorder', { orderedModules }, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        },
        // optimistic update
        onMutate: async (orderedModules) => {
            await queryClient.cancelQueries(queryKey);

            const previous = queryClient.getQueryData(queryKey);

            // apply optimistic ordering if previous exists
            if (previous?.modules) {
                const idToPos = new Map(orderedModules.map(m => [m.id, m.position]));
                const optimisticModules = [...previous.modules]
                    .map(m => ({ ...m, position: idToPos.has(m.id) ? idToPos.get(m.id) : m.position }))
                    .sort((a, b) => a.position - b.position);

                queryClient.setQueryData(queryKey, {
                    ...previous,
                    modules: optimisticModules
                });
            }

            return { previous };
        },
        onError: (err, variables, context) => {
            // rollback
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
        },
        onSettled: () => {
            // always refetch to ensure authoritative order
            queryClient.invalidateQueries(queryKey);
        }
    })
}

// new: update single module
export const useUpdateModule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, title, description }) => {
            const response = await axiosInstance.patch(`/course/modules/${id}`, { title, description }, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        },
        onMutate: async ({ id, title, description }) => {
            // optimistic update in modules list
            await queryClient.cancelQueries(); // safe: we'll only set modules key below
            // find relevant course key(s) and update if present
            const queries = queryClient.getQueryCache().findAll(({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'modules');
            const previous = {};
            queries.forEach(q => {
                previous[q.queryKey] = queryClient.getQueryData(q.queryKey);
                const data = queryClient.getQueryData(q.queryKey);
                if (data?.modules) {
                    queryClient.setQueryData(q.queryKey, {
                        ...data,
                        modules: data.modules.map(m => m.id === id ? { ...m, title: title ?? m.title, description: description ?? m.description } : m)
                    });
                }
            });
            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                Object.entries(context.previous).forEach(([qk, val]) => {
                    queryClient.setQueryData(JSON.parse(qk), val);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries(['modules']);
        }
    });
};

// new: delete module with optimistic removal (requires courseId to build query key when calling)
export const useDeleteModule = (courseId) => {
    const queryClient = useQueryClient();
    const queryKey = ['modules', courseId];

    return useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/course/modules/${id}`);
            return { deletedId: id, ...response.data };
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries(queryKey);
            const previous = queryClient.getQueryData(queryKey);

            if (previous?.modules) {
                const deletedModule = previous.modules.find(m => m.id === id);
                const deletedPosition = deletedModule?.position;
                
                // Optimistically remove the module and adjust positions
                const optimisticModules = previous.modules
                    .filter(m => m.id !== id) // Remove deleted module
                    .map(m => ({
                        ...m,
                        // Decrement position for modules that were after the deleted one
                        position: m.position > deletedPosition ? m.position - 1 : m.position
                    }))
                    .sort((a, b) => a.position - b.position);

                queryClient.setQueryData(queryKey, {
                    ...previous,
                    modules: optimisticModules
                });
            }

            return { previous };
        },
        onError: (err, id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries(queryKey);
        }
    });
};
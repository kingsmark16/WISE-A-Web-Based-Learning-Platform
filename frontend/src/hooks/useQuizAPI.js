import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"

// Query Keys Factory - Better organization and reusability
const quizKeys = {
    all: ['quiz'],
    lists: () => [...quizKeys.all, 'list'],
    list: (filters) => [...quizKeys.lists(), { ...filters }],
    details: () => [...quizKeys.all, 'detail'],
    detail: (id) => [...quizKeys.details(), id],
    submissions: () => [...quizKeys.all, 'submission'],
    submission: (id) => [...quizKeys.submissions(), id],
}

// API Functions - Separate business logic from React Query
const quizAPI = {
    createQuiz: async (quizData) => {
        const { data } = await axiosInstance.post("/quiz", quizData)
        return data
    },
    
    updateQuiz: async ({ quizId, ...quizData }) => {
        const { data } = await axiosInstance.patch(`/quiz/${quizId}`, quizData)
        return data
    },
    
    deleteQuiz: async (quizId) => {
        const { data } = await axiosInstance.delete(`/quiz/${quizId}`)
        return data
    },
    
    publishQuiz: async (quizId) => {
        const { data } = await axiosInstance.patch(`/quiz/${quizId}/publish`)
        return data
    },
    
    getQuiz: async (quizId) => {
        const { data } = await axiosInstance.get(`/quiz/${quizId}`)
        return data
    },
    
    startQuizSubmission: async (quizId) => {
        const { data } = await axiosInstance.post("/quiz/submission/start", { quizId })
        return data
    },
    
    submitQuizAnswers: async (payload) => {
        const { data } = await axiosInstance.post("/quiz/submission/submit", payload)
        return data
    },
    
    getQuizSubmission: async (submissionId) => {
        const { data } = await axiosInstance.get(`/quiz/submission/${submissionId}`)
        return data
    },
}

// Mutations with proper configuration
export const useCreateQuiz = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: quizAPI.createQuiz,
        onSuccess: () => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: quizKeys.lists() })
        },
        onError: (error) => {
            console.error("Failed to create quiz:", error)
        },
    })
}

export const useUpdateQuiz = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: quizAPI.updateQuiz,
        onSuccess: (data, variables) => {
            // Update specific quiz cache
            queryClient.setQueryData(
                quizKeys.detail(variables.quizId),
                data
            )
            // Invalidate list to refetch
            queryClient.invalidateQueries({ queryKey: quizKeys.lists() })
        },
        onError: (error) => {
            console.error("Failed to update quiz:", error)
        },
    })
}

export const useDeleteQuiz = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: quizAPI.deleteQuiz,
        onSuccess: (data, quizId) => {
            // Remove from cache immediately
            queryClient.removeQueries({ queryKey: quizKeys.detail(quizId) })
            // Refetch module lists to reflect the deletion
            queryClient.invalidateQueries({ queryKey: quizKeys.lists() })
        },
        onError: (error) => {
            console.error("Failed to delete quiz:", error)
        },
    })
}

export const usePublishQuiz = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ quizId }) => quizAPI.publishQuiz(quizId),
        onMutate: async ({ quizId, moduleId }) => {
            // Cancel any outgoing refetches to prevent race conditions
            await Promise.all([
                queryClient.cancelQueries({ queryKey: quizKeys.detail(quizId) }),
                moduleId && queryClient.cancelQueries({ queryKey: ['module', moduleId] })
            ])
            
            // Determine new state from current quiz cache
            const currentQuiz = queryClient.getQueryData(quizKeys.detail(quizId))
            const newPublishedState = !currentQuiz?.isPublished
            
            // Snapshot only what we need for rollback
            const previousModule = moduleId ? queryClient.getQueryData(['module', moduleId]) : null
            
            // Optimistically update both caches
            if (currentQuiz) {
                queryClient.setQueryData(quizKeys.detail(quizId), {
                    ...currentQuiz,
                    isPublished: newPublishedState
                })
            }
            
            if (moduleId && previousModule?.module?.quiz) {
                queryClient.setQueryData(['module', moduleId], {
                    ...previousModule,
                    module: {
                        ...previousModule.module,
                        quiz: {
                            ...previousModule.module.quiz,
                            isPublished: newPublishedState
                        }
                    }
                })
            }
            
            return { previousModule, moduleId }
        },
        onSuccess: (data, { quizId, moduleId }) => {
            const updatedQuiz = data.quiz
            
            // Sync with server response - ensures consistency
            queryClient.setQueryData(quizKeys.detail(quizId), updatedQuiz)
            
            if (moduleId) {
                queryClient.setQueryData(['module', moduleId], (old) => ({
                    ...old,
                    module: {
                        ...old.module,
                        quiz: updatedQuiz
                    }
                }))
            }
        },
        onError: (error, { moduleId }, context) => {
            // Rollback: restore previous module state
            if (context?.previousModule && moduleId) {
                queryClient.setQueryData(['module', moduleId], context.previousModule)
            }
            console.error("Failed to publish/unpublish quiz:", error?.response?.data?.message || error.message)
        },
    })
}

export const useGetQuiz = (quizId, options = {}) => {
    return useQuery({
        queryKey: quizKeys.detail(quizId),
        queryFn: () => quizAPI.getQuiz(quizId),
        enabled: !!quizId, // Only fetch if quizId exists
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export const useStartQuizSubmission = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: quizAPI.startQuizSubmission,
        onSuccess: (data) => {
            // Cache the submission
            queryClient.setQueryData(
                quizKeys.submission(data.id),
                data
            )
        },
        onError: (error) => {
            console.error("Failed to start quiz submission:", error)
        },
    })
}

export const useSubmitQuizAnswers = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: quizAPI.submitQuizAnswers,
        onSuccess: (data) => {
            // Update submission cache
            queryClient.setQueryData(
                quizKeys.submission(data.submissionId),
                data
            )
        },
        onError: (error) => {
            console.error("Failed to submit quiz answers:", error)
        },
    })
}

export const useGetQuizSubmission = (submissionId, options = {}) => {
    return useQuery({
        queryKey: quizKeys.submission(submissionId),
        queryFn: () => quizAPI.getQuizSubmission(submissionId),
        enabled: !!submissionId,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

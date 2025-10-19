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
        mutationFn: (quizId) => quizAPI.publishQuiz(quizId),
        onMutate: async (quizId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: quizKeys.detail(quizId) })
            await queryClient.cancelQueries({ queryKey: ["module"] })
            
            // Snapshot the previous values
            const previousQuiz = queryClient.getQueryData(quizKeys.detail(quizId))
            const previousModules = queryClient.getQueriesData({ queryKey: ["module"] })
            
            // Get the current state to determine the new state
            const currentQuiz = queryClient.getQueryData(quizKeys.detail(quizId))
            const newPublishedState = !currentQuiz?.isPublished
            
            // Optimistically update the quiz cache
            queryClient.setQueryData(quizKeys.detail(quizId), (old) => {
                if (!old) return old
                return {
                    ...old,
                    isPublished: newPublishedState
                }
            })
            
            // Also optimistically update module caches that contain this quiz
            queryClient.setQueriesData({ queryKey: ["module"] }, (old) => {
                if (!old?.module?.quiz || old.module.quiz.id !== quizId) return old
                return {
                    ...old,
                    module: {
                        ...old.module,
                        quiz: {
                            ...old.module.quiz,
                            isPublished: newPublishedState
                        }
                    }
                }
            })
            
            // Return a context object with the snapshotted values
            return { previousQuiz, previousModules }
        },
        onSuccess: (data, quizId) => {
            // Update specific quiz cache with the returned quiz data
            const updatedQuiz = data.quiz || data
            queryClient.setQueryData(
                quizKeys.detail(quizId),
                updatedQuiz
            )
            
            // Update module queries with the new quiz data (avoid refetch to keep optimistic state stable)
            queryClient.setQueriesData({ queryKey: ["module"] }, (old) => {
                if (!old?.module?.quiz || old.module.quiz.id !== quizId) return old
                return {
                    ...old,
                    module: {
                        ...old.module,
                        quiz: updatedQuiz
                    }
                }
            })
        },
        onError: (error, quizId, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousQuiz) {
                queryClient.setQueryData(quizKeys.detail(quizId), context.previousQuiz)
            }
            if (context?.previousModules) {
                context.previousModules.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data)
                })
            }
            console.error("Failed to publish/unpublish quiz:", error)
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

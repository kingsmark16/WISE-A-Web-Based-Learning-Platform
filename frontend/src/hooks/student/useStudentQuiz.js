import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

// Query Keys Factory - Following the established pattern
const studentQuizKeys = {
    all: ['student', 'quiz'],
    submissions: () => [...studentQuizKeys.all, 'submission'],
    submission: (id) => [...studentQuizKeys.submissions(), id],
    submissionsByQuiz: (quizId) => [...studentQuizKeys.all, 'submissions', quizId],
};

// Utility function to generate a unique draft key for localStorage
const getDraftKey = (quizId) => `quiz_draft_${quizId}`;

// API Functions - Separate business logic from React Query
const studentQuizAPI = {
    startQuiz: async ({ quizId, courseId, moduleId }) => {
        const { data } = await axiosInstance.post(`/student/quiz/start/${courseId}/${moduleId}`, { quizId });
        return data;
    },

    submitQuiz: async ({ answers, courseId, moduleId, quizId, startedAt }) => {
        const { data } = await axiosInstance.post(`/student/quiz/submit/${courseId}/${moduleId}`, {
            quizId,
            answers,
            startedAt
        });
        return { ...data, quizId };
    },

    getQuizSubmissions: async (quizId) => {
        const { data } = await axiosInstance.get(`/student/quiz/submissions/${quizId}`);
        return data;
    },
};

/**
 * Hook to start a student quiz
 */
export const useStartStudentQuiz = () => {
    return useMutation({
        mutationFn: studentQuizAPI.startQuiz,
        onError: (error) => {
            console.error("Failed to start student quiz:", error);
        },
    });
};

/**
 * Hook to submit student quiz answers
 */
export const useSubmitStudentQuiz = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: studentQuizAPI.submitQuiz,
        onSuccess: (data, variables) => {
            // Immediately refetch quiz submissions to show new attempt in history
            queryClient.refetchQueries({ queryKey: studentQuizKeys.submissionsByQuiz(variables.quizId) });
        },
        onError: (error) => {
            console.error("Failed to submit student quiz:", error);
        },
    });
};

/**
 * Hook to get active quiz submission data
 */
export const useStudentQuizSubmission = (submissionId) => {
    return useQuery({
        queryKey: studentQuizKeys.submission(submissionId),
        queryFn: () => null, // Data is set via mutations, not fetched
        enabled: !!submissionId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
};

/**
 * Hook to get all quiz submissions/attempts for a quiz
 */
export const useStudentQuizSubmissions = (quizId) => {
    return useQuery({
        queryKey: studentQuizKeys.submissionsByQuiz(quizId),
        queryFn: () => studentQuizAPI.getQuizSubmissions(quizId),
        enabled: !!quizId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
};
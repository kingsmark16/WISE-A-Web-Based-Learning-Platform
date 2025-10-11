import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from 'react-toastify';

export const useEditPdf = (moduleId = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, title, type }) => {
      if (!lessonId) throw new Error("lessonId is required");
      if (!title || String(title).trim() === "") throw new Error("title is required");

      if (String(type || "").toUpperCase() !== "PDF") {
        return { ok: false, skipped: true, message: "Not a PDF lesson" };
      }

      const response = await axiosInstance.put(`/upload-pdf/${lessonId}`, { title });
      return response.data;
    },

    // OPTIMISTIC UPDATE: apply immediately before network
    onMutate: async (variables) => {
      const { lessonId, title } = variables;
      if (!moduleId) return { snapshot: null };

      await queryClient.cancelQueries(["module", moduleId]);
      const snapshot = queryClient.getQueryData(["module", moduleId]);

      // apply immediate patch
      queryClient.setQueryData(["module", moduleId], (old) => {
        if (!old || !old.module) return old;
        const updatedLessons = (old.module.lessons || []).map((l) =>
          l.id === lessonId ? { ...l, title } : l
        );
        return { ...old, module: { ...old.module, lessons: updatedLessons } };
      });

      return { snapshot };
    },

    // rollback on error
    onError: (error, variables, context) => {
      console.error("Failed to edit PDF lesson:", error);
      if (moduleId && context?.snapshot) {
        queryClient.setQueryData(["module", moduleId], context.snapshot);
      }
      toast.error('Failed to update PDF lesson. Please try again.');
    },

    // keep onSuccess no-op (optimistic applied)
    onSuccess: () => {
      toast.success('PDF lesson updated successfully!');
    },

    // ensure a fresh server fetch afterwards
    onSettled: () => {
      if (moduleId) {
        queryClient.invalidateQueries(["module", moduleId]);
      } else {
        queryClient.invalidateQueries({ queryKey: ["module"], exact: false });
      }
    },
  });
};

export default useEditPdf;
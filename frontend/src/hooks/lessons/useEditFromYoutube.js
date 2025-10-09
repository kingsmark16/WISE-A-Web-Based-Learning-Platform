import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from 'react-toastify';

export const useEditFromYoutube = (moduleId = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, title, description, type }) => {
      if (!lessonId) throw new Error("lessonId is required");
      if (!title && typeof description === "undefined") throw new Error("title or description is required");

      // Only edit if lesson type is YOUTUBE
      if (String(type || "").toUpperCase() !== "YOUTUBE") {
        return { ok: false, skipped: true, message: "Not a YOUTUBE lesson" };
      }

      // Use FormData to match multipart handling on the server (multer.none())
      const form = new FormData();
      if (typeof title === "string") form.append("title", title);
      if (typeof description === "string") form.append("description", description);

      const response = await axiosInstance.patch(`/youtube-lessons/${lessonId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    },

    // OPTIMISTIC UPDATE: apply immediately before network
    onMutate: async (variables) => {
      const { lessonId, title, description } = variables;
      if (!moduleId) return { snapshot: null };

      await queryClient.cancelQueries(["module", moduleId]);
      const snapshot = queryClient.getQueryData(["module", moduleId]);

      queryClient.setQueryData(["module", moduleId], (old) => {
        if (!old || !old.module) return old;
        const updatedLessons = (old.module.lessons || []).map((l) =>
          l.id === lessonId ? { ...l, ...(typeof title === "string" ? { title } : {}), ...(typeof description === "string" ? { description } : {}) } : l
        );
        return { ...old, module: { ...old.module, lessons: updatedLessons } };
      });

      return { snapshot };
    },

    // rollback on error
    onError: (error, variables, context) => {
      console.error("Failed to edit YouTube lesson:", error);
      if (moduleId && context?.snapshot) {
        queryClient.setQueryData(["module", moduleId], context.snapshot);
      }
      toast.error('Failed to update YouTube lesson. Please try again.');
    },

    onSuccess: () => {
      toast.success('YouTube lesson updated successfully!');
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

export default useEditFromYoutube;
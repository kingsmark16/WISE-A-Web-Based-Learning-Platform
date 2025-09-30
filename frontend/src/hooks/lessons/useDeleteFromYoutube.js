import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

export const useDeleteFromYoutube = (moduleId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, type }) => {
      if (!lessonId) throw new Error("lessonId is required");

      // Only delete if lesson type is YOUTUBE
      if (String(type || "").toUpperCase() !== "YOUTUBE") {
        return { ok: false, skipped: true, message: "Not a YOUTUBE lesson" };
      }

      const response = await axiosInstance.delete(`/youtube-lessons/${lessonId}`);

      return response.data;
    },
    // optimistic update: remove lesson from module cache immediately
    onMutate: async ({ lessonId }) => {
      if (!moduleId) return;
      await queryClient.cancelQueries(["module", moduleId]);
      const previous = queryClient.getQueryData(["module", moduleId]);
      if (previous?.module?.lessons) {
        queryClient.setQueryData(["module", moduleId], (old) => {
          const copy = JSON.parse(JSON.stringify(old));
          copy.module.lessons = (copy.module.lessons || []).filter((l) => l.id !== lessonId);
          return copy;
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && moduleId) {
        queryClient.setQueryData(["module", moduleId], context.previous);
      }
    },
    onSettled: () => {
      if (moduleId) queryClient.invalidateQueries(["module", moduleId]);
    },
  });
};

export default useDeleteFromYoutube;
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from 'react-toastify';

export const useDeleteFromDropbox = (moduleId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, type }) => {
      if (!lessonId) throw new Error("lessonId is required");

      // Only delete if lesson type is DROPBOX
      if (String(type || "").toUpperCase() !== "DROPBOX") {
        return { ok: false, skipped: true, message: "Not a DROPBOX lesson" };
      }

      const response = await axiosInstance.delete(`/upload-dropbox/${lessonId}`);

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
      toast.error('Failed to delete Dropbox lesson. Please try again.');
    },
    onSuccess: () => {
      toast.success('Dropbox lesson deleted successfully!');
    },
    onSettled: () => {
      if (moduleId) queryClient.invalidateQueries(["module", moduleId]);
    },
  });
};

export default useDeleteFromDropbox;
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from 'react-toastify';

export const useDeleteLink = (moduleId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId }) => {
      if (!linkId) throw new Error("linkId is required");
      const response = await axiosInstance.delete(`/link/${linkId}`);
      return response.data;
    },
    // optimistic update: remove link from module cache immediately
    onMutate: async ({ linkId }) => {
      if (!moduleId) return;
      await queryClient.cancelQueries(["module", moduleId]);
      const previous = queryClient.getQueryData(["module", moduleId]);
      if (previous?.module?.links) {
        queryClient.setQueryData(["module", moduleId], (old) => {
          const copy = JSON.parse(JSON.stringify(old));
          copy.module.links = (copy.module.links || []).filter((l) => l.id !== linkId);
          return copy;
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && moduleId) {
        queryClient.setQueryData(["module", moduleId], context.previous);
      }
      toast.error('Failed to delete link. Please try again.');
    },
    onSuccess: () => {
      toast.success('Link deleted successfully!');
    },
    onSettled: () => {
      if (moduleId) queryClient.invalidateQueries(["module", moduleId]);
    },
  });
};

export default useDeleteLink;
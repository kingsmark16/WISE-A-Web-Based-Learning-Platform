import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from 'react-toastify';

export const useEditLink = (moduleId = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, title, description, url, position }) => {
      if (!linkId) throw new Error("linkId is required");
      if (!title || String(title).trim() === "") throw new Error("title is required");

      const response = await axiosInstance.put(`/link/${linkId}`, {
        title: String(title).trim(),
        description: description || '',
        url: url ? String(url).trim() : undefined,
        position
      });
      return response.data;
    },

    // OPTIMISTIC UPDATE: apply immediately before network
    onMutate: async (variables) => {
      const { linkId, title, description, url, position } = variables;
      if (!moduleId) return { snapshot: null };

      await queryClient.cancelQueries(["module", moduleId]);
      const snapshot = queryClient.getQueryData(["module", moduleId]);

      // apply immediate patch
      queryClient.setQueryData(["module", moduleId], (old) => {
        if (!old || !old.module) return old;
        const updatedLinks = (old.module.links || []).map((l) =>
          l.id === linkId ? {
            ...l,
            title,
            description: description || l.description,
            url: url || l.url,
            position: position !== undefined ? position : l.position
          } : l
        );
        return { ...old, module: { ...old.module, links: updatedLinks } };
      });

      return { snapshot };
    },

    // rollback on error
    onError: (error, variables, context) => {
      console.error("Failed to edit link:", error);
      if (moduleId && context?.snapshot) {
        queryClient.setQueryData(["module", moduleId], context.snapshot);
      }
      toast.error('Failed to update link. Please try again.');
    },

    onSuccess: () => {
      toast.success('Link updated successfully!');
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

export default useEditLink;
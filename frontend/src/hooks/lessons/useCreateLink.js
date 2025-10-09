import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from 'react-toastify';

export const useCreateLink = (moduleId = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, url, position }) => {
      if (!url) throw new Error("URL is required");
      if (!title || String(title).trim() === "") throw new Error("Title is required");

      const response = await axiosInstance.post('/link', {
        moduleId,
        title: String(title).trim(),
        description: description || '',
        url: String(url).trim(),
        position
      });
      return response.data;
    },

    // OPTIMISTIC UPDATE: add link to module cache immediately
    onMutate: async (variables) => {
      if (!moduleId) return { snapshot: null };

      await queryClient.cancelQueries(["module", moduleId]);
      const snapshot = queryClient.getQueryData(["module", moduleId]);

      // Create optimistic link object
      const optimisticLink = {
        id: `temp-${Date.now()}`,
        title: variables.title,
        description: variables.description || '',
        url: variables.url,
        position: variables.position || 999, // temporary position
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to links array
      queryClient.setQueryData(["module", moduleId], (old) => {
        if (!old || !old.module) return old;
        const updatedLinks = [...(old.module.links || []), optimisticLink];
        return { ...old, module: { ...old.module, links: updatedLinks } };
      });

      return { snapshot };
    },

    // rollback on error
    onError: (error, variables, context) => {
      console.error("Failed to create link:", error);
      if (moduleId && context?.snapshot) {
        queryClient.setQueryData(["module", moduleId], context.snapshot);
      }
      toast.error('Failed to create link. Please try again.');
    },

    onSuccess: () => {
      toast.success('Link created successfully!');
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

export default useCreateLink;
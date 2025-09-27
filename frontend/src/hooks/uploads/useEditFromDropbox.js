import { QueryClient, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

export const useEditFromDropbox = () => {

  const queryClient = new QueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, title, type }) => {
      if (!lessonId) throw new Error("lessonId is required");
      if (!title || String(title).trim() === "") throw new Error("title is required");

      // Only edit if lesson type is DROPBOX
      if (String(type || "").toUpperCase() !== "DROPBOX") {
        return { ok: false, skipped: true, message: "Not a DROPBOX lesson" };
      }

      // Call backend to edit Dropbox lesson (rename)
      const response = await axiosInstance.put(`/upload-dropbox/${lessonId}`, { title });
      return response.data;
    },
    onError: (error) => {
      // Handle error (show toast, log, etc.)
      console.error("Failed to edit Dropbox lesson:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
    onSettled: () => {
      // Optionally do something after mutation finishes
    },
  });
};

export default useEditFromDropbox;
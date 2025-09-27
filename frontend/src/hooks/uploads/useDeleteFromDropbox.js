import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

export const useDeleteFromDropbox = () => {
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
  });
};

export default useDeleteFromDropbox;
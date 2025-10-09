import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

// controllers map persisted per-upload to allow cancellations
const controllers = new Map();

export const useUploadToYoutube = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const uploadId = payload?.uploadId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const controller = new AbortController();
      controllers.set(uploadId, controller);

      let formData;
      if (payload instanceof FormData) {
        formData = payload;
      } else {
        formData = new FormData();

        // files should be appended under the field name "video" (server expects req.files)
        if (payload?.files) {
          const files = Array.isArray(payload.files) ? payload.files : Array.from(payload.files);
          files.forEach((f) => formData.append("video", f));
        }

        // optional metadata the server understands
        if (payload?.videoMetadata !== undefined) {
          // server expects JSON in req.body.videoMetadata
          formData.append("videoMetadata", JSON.stringify(payload.videoMetadata));
        }
        if (payload?.moduleId !== undefined) formData.append("moduleId", String(payload.moduleId));
        if (payload?.title !== undefined) formData.append("title", String(payload.title));
        if (payload?.description !== undefined) formData.append("description", String(payload.description));
        if (payload?.position !== undefined) formData.append("position", String(payload.position));
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
        onUploadProgress: (evt) => {
          try {
            if (!evt || !evt.total) return;
            const percent = Math.round((evt.loaded / evt.total) * 100);
            if (typeof payload?.onProgress === "function") payload.onProgress(percent);
            if (typeof options?.onProgress === "function") options.onProgress(percent);
          } catch (e) {
            console.error("Upload progress error:", e);
          }
        },
      };

      try {
        // NOTE: axiosInstance baseURL should already point to /api
        const res = await axiosInstance.post("/youtube-lessons/upload", formData, config);
        return { data: res.data, uploadId };
      } finally {
        // ensure controller cleaned up
        controllers.delete(uploadId);
      }
    },

    // when upload succeeds, merge returned lessons into module cache and schedule refetches
    onSuccess: (result, variables) => {
      try {
        const modId = variables?.moduleId ?? options?.moduleId;
        const uploaded = result?.data?.uploadedVideos ?? result?.data?.uploaded ?? result?.data?.uploadResults ?? [];

        if (!modId) {
          // no module context — nothing to merge; still trigger global invalidation to ensure fresh data
          queryClient.invalidateQueries({ queryKey: ["module"], exact: false });
          return;
        }

        if (!Array.isArray(uploaded) || uploaded.length === 0) {
          queryClient.invalidateQueries(["module", modId]);
          return;
        }

        // Merge returned lessons into module cache (avoid dupes)
        queryClient.cancelQueries(["module", modId]);
        queryClient.setQueryData(["module", modId], (old) => {
          if (!old || !old.module) return old;
          const copy = JSON.parse(JSON.stringify(old));
          const existing = new Map(((copy.module.lessons || [])).map((l) => [l.id, l]));
          for (const u of uploaded) {
            // server returns uploadedVideos[].video (the saved lesson) in current API
            const lesson = u?.video ?? u?.video?.video ?? u;
            if (!lesson || !lesson.id) continue;
            existing.set(lesson.id, lesson);
          }
          copy.module.lessons = Array.from(existing.values()).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
          return copy;
        });

        // schedule a couple of refetches to pick up final thumbnails / processing state
        setTimeout(() => queryClient.invalidateQueries(["module", modId]), 3000);
        setTimeout(() => queryClient.invalidateQueries(["module", modId]), 10000);
      } catch (e) {
        console.error("useUploadToYoutube onSuccess merge error:", e);
      }
    },

    onError: options.onError ?? (() => {}),
    onSettled: options.onSettled ?? (() => {}),
    onMutate: options.onMutate ?? (() => {}),
  });

  const cancelUpload = (uploadId) => {
    const c = controllers.get(uploadId);
    if (c) {
      try {
        c.abort();
      } catch {
        /* ignore */
      }
      controllers.delete(uploadId);
      return true;
    }
    return false;
  };

  return { ...mutation, cancelUpload };
};

export default useUploadToYoutube;
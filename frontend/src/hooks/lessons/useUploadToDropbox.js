import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

// controllers map persisted per-module import to allow cancellations
const controllers = new Map();

export const useUploadToDropbox = (options = {}) => {
    const mutation = useMutation({
        mutationFn: async (payload) => {
            const uploadId = payload?.uploadId ?? `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
            const controller = new AbortController();
            controllers.set(uploadId, controller);

            let formData;
            if (payload instanceof FormData) {
                formData = payload;
            } else {
                formData = new FormData();
                if (payload?.files) {
                    const files = Array.isArray(payload.files) ? payload.files : Array.from(payload.files);
                    files.forEach((f) => formData.append("file", f));
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
                const res = await axiosInstance.post("/upload-dropbox", formData, config);
                return { data: res.data, uploadId };
            } finally {
                // ensure controller cleaned up
                controllers.delete(uploadId);
            }
        },

        onMutate: options.onMutate ?? (() => {}),
        onError: options.onError ?? (() => {}),
        onSuccess: options.onSuccess ?? (() => {}),
        onSettled: options.onSettled ?? (() => {}),
    });

    const cancelUpload = (uploadId) => {
        const c = controllers.get(uploadId);
        if (c) {
            try {
                c.abort();
            } catch { /* ignore */ }
            controllers.delete(uploadId);
            return true;
        }
        return false;
    };

    return { ...mutation, cancelUpload };
};
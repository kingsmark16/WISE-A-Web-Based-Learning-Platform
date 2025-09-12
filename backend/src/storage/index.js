import * as supa from "./providers/supabase.js";

export const storage = {
  async uploadPdf({ key, buffer }) {
    return supa.uploadBuffer({ key, buffer, contentType: "application/pdf" });
  },
  async getViewUrl({ key, seconds = 60 * 60 }) {
    return supa.signedUrl({ key, expiresIn: seconds }); // inline/preview
  },
  async getDownloadUrl({ key, filename, seconds = 60 * 60 }) {
    return supa.signedUrl({ key, expiresIn: seconds, downloadName: filename }); // force download
  },
  async remove(key) {
    return supa.removeObject(key);
  },
};

import {Dropbox} from 'dropbox';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeStatic from 'ffprobe-static';
import { Readable } from 'stream';


const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeStatic.path);

if(!DROPBOX_ACCESS_TOKEN){
    throw new Error("Missing DROPBOX_ACCESS_TOKEN in env");
}

const dbx = new Dropbox({accessToken: DROPBOX_ACCESS_TOKEN});

export const uploadToDropbox = async ({buffer, filename, path = ''}) => {
    const dropboxPath = `/${path}${filename}`;

    try {

        const response = await dbx.filesUpload({
            path: dropboxPath,
            contents: buffer,
            mode: 'add',
            autorename: true,
            mute: false
        });

        return response;
        
    } catch (error) {
        throw new Error('Dropbox upload failed: ' + e.message);
    }
}


export const getPermanentLink = async (dropboxPath) => {
  try {
    const { result } = await dbx.sharingCreateSharedLinkWithSettings({ path: dropboxPath });
    // The returned URL is a preview link; to force direct download, replace ?dl=0 with ?dl=1
    return result.url.replace('?dl=0', '?dl=1');
  } catch (e) {
    // If link already exists, Dropbox throws an error; fetch existing link:
    if (e?.error?.shared_link_already_exists) {
      const { result } = await dbx.sharingListSharedLinks({ path: dropboxPath, direct_only: true });
      if (result.links.length > 0) {
        return result.links[0].url.replace('?dl=0', '?dl=1');
      }
    }
    throw new Error('Dropbox permanent link failed: ' + e.message);
  }
}

export const getVideoDuration = async (buffer) => {
    return new Promise((resolve, reject) => {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    ffmpeg(stream)
      .ffprobe((err, data) => {
        if (err) return reject(err);
        resolve(data.format.duration); // duration in seconds
      });
  });
}
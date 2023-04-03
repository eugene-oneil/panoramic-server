import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as ffmpeg from "fluent-ffmpeg";

const ffprobe = ffmpeg.ffprobe;
dotenv.config();

export class FileInfo {
  readonly mtype: string;
  readonly filepath: string;
  readonly name: string;
  readonly directory: string;
  readonly extension: string;
  readonly size: string;
  readonly modified: Date;
  readonly created: Date;
  readonly isFile: boolean;
  readonly isDir: boolean;
  readonly audio_streams: number;
  readonly video_streams: number;
  readonly vcodec: string | undefined;
  readonly acodec: string | undefined;
  readonly width: number | undefined;
  readonly height: number | undefined;
  readonly fps: number | undefined;
  readonly field_order: string | undefined;
  readonly sample_rate: number | undefined;
  readonly aspect_ratio: string | undefined;
  readonly format: string | undefined;
  readonly encoder: string | undefined;
  readonly duration: number | undefined;
  readonly bit_rate: number | undefined;

  constructor(
    filepath: string,
    stats: fs.Stats,
    data: ffmpeg.FfprobeData | undefined = undefined
  ) {
    this.mtype = "file";
    this.filepath = filepath;
    this.name = path.basename(filepath);
    this.directory = path.dirname(filepath);
    this.extension = path.extname(filepath).toLowerCase();
    this.size = size_str(stats.size);
    this.modified = stats.mtime;
    this.created = stats.ctime;
    this.isFile = stats.isFile();
    this.isDir = stats.isDirectory();
    this.audio_streams = 0;
    this.video_streams = 0;
    if (data != undefined) {
      this.duration = data.format.duration;
      this.bit_rate = data.format.bit_rate;
      this.format = data.format.format_long_name;
      if (data.format.tags && data.format.tags.encoder != undefined) {
        this.encoder = data.format.tags.encoder.toString();
      }
      for (const stream of data.streams) {
        if (stream.codec_type == "audio") {
          this.audio_streams++;
          if (this.audio_streams == 1) {
            this.acodec = stream.codec_name;
            this.sample_rate = stream.sample_rate;
          }
        } else if (stream.codec_type == "video") {
          this.video_streams++;
          if (this.video_streams == 1) {
            this.vcodec = stream.codec_name;
            this.width = stream.coded_width;
            this.height = stream.coded_height;
            this.aspect_ratio = stream.display_aspect_ratio;
            if (stream.feild_order != "unknown") {
              this.field_order = stream.field_order;
            }
            this.fps = fps_val(stream.avg_frame_rate);
          }
        }
      }
    }
  }
}

const media_extensions = [".mp4", ".avi", ".jpg"];

function size_str(size: number) {
  if (size > 1000000000) {
    return (size / 1000000000).toString() + " GB";
  }
  if (size > 1000000) {
    return (size / 1000000).toString() + " MB";
  }
  if (size > 1000) {
    return (size / 1000).toString() + " kB";
  }
  return size.toString() + " bytes";
}

function fps_val(str: string | undefined) {
  if (str == undefined) return undefined;
  const split = str.split("/");
  if (split.length == 2) {
    return Math.round((100 * Number(split[0])) / Number(split[1])) / 100;
  }
  return Number(str);
}

export function file_info(filepath: string): Promise<FileInfo> {
  const stats = fs.statSync(filepath);
  const extension = path.extname(filepath).toLowerCase();
  const is_media = stats.isFile() && media_extensions.includes(extension);
  return new Promise((resolve, reject) => {
    if (is_media) {
      ffprobe(filepath, (err, data) => {
        resolve(new FileInfo(filepath, stats, data));
      });
    } else {
      resolve(new FileInfo(filepath, stats));
    }
  });
}

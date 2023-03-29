"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.file_info = exports.FileInfo = void 0;
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ffmpeg = __importStar(require("fluent-ffmpeg"));
const ffprobe = ffmpeg.ffprobe;
dotenv.config();
class FileInfo {
    constructor(filepath, stats, data = undefined) {
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
                }
                else if (stream.codec_type == "video") {
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
exports.FileInfo = FileInfo;
const media_extensions = [".mp4", ".avi", ".jpg"];
function size_str(size) {
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
function fps_val(str) {
    if (str == undefined)
        return undefined;
    const split = str.split("/");
    if (split.length == 2) {
        return Math.round((100 * Number(split[0])) / Number(split[1])) / 100;
    }
    return Number(str);
}
function file_info(filepath) {
    const stats = fs.statSync(filepath);
    const extension = path.extname(filepath).toLowerCase();
    const is_media = stats.isFile() && media_extensions.includes(extension);
    return new Promise((resolve, reject) => {
        if (is_media) {
            ffprobe(filepath, (err, data) => {
                resolve(new FileInfo(filepath, stats, data));
            });
        }
        else {
            resolve(new FileInfo(filepath, stats));
        }
    });
}
exports.file_info = file_info;

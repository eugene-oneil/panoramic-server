import * as WebSocket from "ws";
import * as fs from "fs";
import * as path from "path";
import { file_info } from "./FileInfo";

export class ClientSocket {
  private readonly socket;
  constructor(socket: WebSocket) {
    this.socket = socket;
    this.socket.on("message", (message: string) => {
      this.process(JSON.parse(message));
    });

    //send immediatly a feedback to the incoming connection
  }

  send(data: any) {
    this.socket.send(JSON.stringify(data));
  }

  async upload_directory(directory: string) {
    if (directory == undefined) return false;
    const dirlist = fs.readdirSync(directory);
    let first: boolean = true;
    for (const idx in dirlist) {
      const filename = dirlist[idx];
      const fpath = path.join(directory.toString(), filename);
      const info = await file_info(fpath);
      this.send({
        add: [info],
      });
    }
  }

  process(data: any) {
    const mtype: string = data["mtype"];
    if (mtype == "log") {
      console.log(data["message"]);
    } else {
      console.log("unknown message: %s", data);
    }
  }
}

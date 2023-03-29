import express, { Express, Request, Response } from "express";
import cors from "cors";
import * as WebSocket from 'ws';
import * as path from "path";
import * as fs from "fs";
import { FileInfo, file_info } from "./FileInfo";

const app: Express = express();
const port = process.env.PORT;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/list", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200")
  res.write("[");
  const directory = req.query.dir as string;
  if (directory == undefined) return false;
  const dirlist = fs.readdirSync(directory);
  let first: boolean = true;
  for (const idx in dirlist) {
    const filename = dirlist[idx];
    const fpath = path.join(directory.toString(), filename);
    const info = await file_info(fpath);
    if (first) {
      first = false;
    } else {
      res.write(",");
    }
    res.write(JSON.stringify(info));
  }
  res.write("]");
  res.end();
});
// Add a list of allowed origins.
// If you have more origins you would like to add, you can add them to the array below.
const allowedOrigins = ['http://localhost:4200'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors(options));

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/list?dir=P:\\Downloads`);
});

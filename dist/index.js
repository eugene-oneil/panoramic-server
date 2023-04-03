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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const WebSocket = __importStar(require("ws"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const FileInfo_1 = require("./FileInfo");
const http = __importStar(require("http"));
const ClientSocket_1 = require("./ClientSocket");
const app = (0, express_1.default)();
const port = process.env.PORT;
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("got list request");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    res.write("[");
    const directory = req.query.dir;
    if (directory == undefined)
        return false;
    const dirlist = fs.readdirSync(directory);
    let first = true;
    for (const idx in dirlist) {
        const filename = dirlist[idx];
        const fpath = path.join(directory.toString(), filename);
        const info = yield (0, FileInfo_1.file_info)(fpath);
        if (first) {
            first = false;
        }
        else {
            res.write(",");
        }
        res.write(JSON.stringify(info));
    }
    res.write("]");
    res.end();
}));
// Add a list of allowed origins.
// If you have more origins you would like to add, you can add them to the array below.
const allowedOrigins = ["http://localhost:4200"];
const options = {
    origin: allowedOrigins,
};
app.use((0, cors_1.default)(options));
app.use(express_1.default.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on("connection", (client) => {
    new ClientSocket_1.ClientSocket(client).upload_directory("F:Videos");
});
//start our server
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/list?dir=P:\\Downloads`);
});

import express, { Request, Response } from "express";
import bson from "bson";
import fs from "fs";
import path from "path";
import PQueue from "p-queue";

const fileQueue = new PQueue({ concurrency: 5 });

const docs = [];
const assets = new Set();

function readFilesInDir(dirPath: string) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const fileStats = fs.statSync(filePath);

    if (fileStats.isDirectory()) {
      readFilesInDir(filePath);
    } else {
      // console.log({filePath})
      fileQueue.add(async () => {
        if (filePath.includes(`documents/`) && filePath.endsWith(`.bson`)) {
          const fileContent = await fs.promises.readFile(filePath);
          const parsed = bson.deserialize(fileContent);
          docs.push(parsed);
        } else if (filePath.includes(`/assets/`)) {
          assets.add(filePath);
        }
      });
    }
  });
}

readFilesInDir("./manual-master"); // Replace with the actual path to your directory

let specialPageDoc;
let specialPageDocTitle;
fileQueue.onIdle().then(() => {
  console.log(`idle now`);
  specialPageDoc = docs.slice(4, 5)[0];
  specialPageDocTitle =
    specialPageDoc.ast.children[0].children[0].children[0].value;
});

const app = express();

app.get("/docs", (req: Request, res: Response) => {
  const mutatedDoc = { ...specialPageDoc };
  const title = specialPageDocTitle + ` (${Math.random()})`;
  mutatedDoc.ast.children[0].children[0].children[0].value = title;
  res.json({ timestamp: Date.now(), pages: [mutatedDoc] });
});

app.get("/docs/updated/:timestamp", (req: Request, res: Response) => {
  const mutatedDoc = { ...specialPageDoc };
  const title = specialPageDocTitle + ` (${Math.random()})`;
  mutatedDoc.ast.children[0].children[0].children[0].value = title;
  res.json({ timestamp: Date.now(), pages: [mutatedDoc] });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

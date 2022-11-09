import { PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";
import { s3Client } from "./libs/s3Client";

const file = "./temp/index.ts";
const fileStream = fs.createReadStream(file);

export const uploadParams = {
  Bucket: "jaamtoast-backend",
  Key: path.basename(file),
  Body: fileStream,
};

export const run = async () => {
  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("Success", data);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

run();

import {
  PutObjectCommandOutput,
  S3Client as SdkS3Client,
} from "@aws-sdk/client-s3";
import { PutObjectCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { createReadStream } from "fs";
import { readdir } from "fs/promises";
import path from "path";

import Config from "./@config";

export class S3Client {
  private client = new SdkS3Client({
    region: Config.AWS_REGION,
    apiVersion: "2006-03-01",
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  });

  async create({ bucketName }: { bucketName: string }) {
    try {
      const data = await this.client.send(
        new CreateBucketCommand({ Bucket: bucketName }),
      );

      console.log("Successfully created a bucket called ", data.Location);
      return data;
    } catch (err) {
      console.log("Error", err);
    }
  }

  private async getFiles(dir: string): Promise<string[]> {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map(dirent => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? this.getFiles(res) : res;
      }),
    );
    return Array.prototype.concat(...files);
  }

  async uploadFiles({
    filesPath,
    bucketName,
  }: {
    filesPath: string;
    bucketName: string;
  }): Promise<PutObjectCommandOutput[]> {
    try {
      const files = await this.getFiles(filesPath);

      const result = Promise.all(
        files.map(filePath =>
          this.client.send(
            new PutObjectCommand({
              Key: path.relative(filesPath, filePath),
              Bucket: bucketName,
              Body: createReadStream(filePath),
            }),
          ),
        ),
      );

      console.log("Build folder upload complete.");

      return result;
    } catch (error) {
      console.error("upload fail", error);
      throw error;
    }
  }
}

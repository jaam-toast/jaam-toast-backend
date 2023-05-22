import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { injectable } from "inversify";
import { createReadStream } from "fs";

import Config from "./@config";

@injectable()
export class S3AssetClient {
  private s3Client = new S3Client({
    region: Config.AWS_REGION,
    apiVersion: "2006-03-01",
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  });

  async uploadFile({
    bucketName,
    folderName,
    fileName,
    mimetype,
    path,
  }: {
    bucketName: string;
    folderName: string;
    fileName: string;
    mimetype: string;
    path: string;
  }) {
    try {
      const specialCharRegex = /[^\w\d]+/g;
      const name = fileName.replace(specialCharRegex, "-");
      const putObjectCommand = new PutObjectCommand({
        Key: `${folderName}/${name}`,
        Bucket: bucketName,
        Body: createReadStream(path),
        ContentType: mimetype,
      });

      await this.s3Client.send(putObjectCommand);

      return { key: `${folderName}/${name}`, name };
    } catch (error) {
      throw error;
    }
  }

  async deleteFile({ bucketName, key }: { bucketName: string; key: string }) {
    try {
      const deleteParams = {
        Bucket: bucketName,
        Key: key,
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);

      await this.s3Client.send(deleteCommand);
    } catch (error) {
      throw error;
    }
  }
}

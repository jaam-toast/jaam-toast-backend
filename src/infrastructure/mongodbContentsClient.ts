import { injectable } from "inversify";
import { MongoClient } from "mongodb";
import Config from "../config";

export interface ContentsClient {
  createRepository({
    jsonSchema,
    projectName,
  }: {
    jsonSchema: {
      title: string;
    };
    projectName: string;
  }): Promise<void>;
}

@injectable()
export class mongodbContentsClient implements ContentsClient {
  private client = new MongoClient(Config.CONTENTS_DATABASE_URL);

  async createRepository({
    jsonSchema,
    projectName,
  }: {
    jsonSchema: {
      title: string;
    };
    projectName: string;
  }) {
    try {
      await this.client.connect();
      await this.client.db(projectName).createCollection(jsonSchema.title, {
        validator: {
          $jsonSchema: jsonSchema,
        },
      });
    } catch (error) {
      throw error;
    } finally {
      await this.client.close();
    }
  }
}

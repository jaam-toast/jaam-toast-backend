import { injectable } from "inversify";
import { MongoClient } from "mongodb";

import Config from "../config";
export interface ContentsClient {
  createStorage: ({
    jsonSchema,
    projectName,
  }: {
    jsonSchema: {
      title: string;
    };
    projectName: string;
  }) => Promise<void>;
  setStorageSchema: ({
    projectName,
    schemaName,
    jsonSchema,
  }: {
    projectName: string;
    schemaName: string;
    jsonSchema: {};
  }) => Promise<void>;
  deleteStorage: ({
    projectName,
    schemaName,
  }: {
    projectName: string;
    schemaName: string;
  }) => Promise<void>;
}

@injectable()
export class mongodbContentsClient implements ContentsClient {
  private static _client: MongoClient | null = null;

  get client(): MongoClient {
    if (!mongodbContentsClient._client) {
      throw new Error(
        "The connection to the contents database was not established.",
      );
    }

    return mongodbContentsClient._client;
  }

  static async connect() {
    mongodbContentsClient._client = new MongoClient(
      Config.CONTENTS_DATABASE_URL,
    );

    try {
      await mongodbContentsClient._client.connect();
    } catch (error) {
      throw error;
    }
  }

  static async close() {
    await mongodbContentsClient._client?.close();

    mongodbContentsClient._client = null;
  }

  async createStorage({
    jsonSchema,
    projectName,
  }: {
    jsonSchema: {
      title: string;
    };
    projectName: string;
  }) {
    try {
      await this.client.db(projectName).createCollection(jsonSchema.title, {
        validator: {
          $jsonSchema: jsonSchema,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async setStorageSchema({
    projectName,
    schemaName,
    jsonSchema,
  }: {
    projectName: string;
    schemaName: string;
    jsonSchema: {};
  }) {
    try {
      await this.client.db(projectName).command({
        collMod: schemaName,
        validator: {
          $jsonSchema: jsonSchema,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteStorage({
    projectName,
    schemaName,
  }: {
    projectName: string;
    schemaName: string;
  }) {
    try {
      await this.client.db(projectName).dropCollection(schemaName);
    } catch (error) {
      throw error;
    }
  }
}

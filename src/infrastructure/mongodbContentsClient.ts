import { injectable } from "inversify";
import {
  Document,
  InsertOneResult,
  MongoClient,
  ObjectId,
  WithId,
} from "mongodb";

import Config from "../config";
export interface ContentsClient {
  createStorage: (createStorageOptions: {
    jsonSchema: {
      title: string;
    };
    projectName: string;
  }) => Promise<void>;

  deleteStorage: (deleteStorageOptions: {
    projectName: string;
    schemaName: string;
  }) => Promise<void>;

  createContents: (createContentsOptions: {
    projectName: string;
    schemaName: string;
    contents: { [key: string]: string };
  }) => Promise<InsertOneResult<Document>>;

  updateContents: (updateContentsOptions: {
    projectName: string;
    schemaName: string;
    contentsId: string;
    contents: unknown;
  }) => Promise<void>;

  deleteContents: (deleteContentsOptions: {
    projectName: string;
    schemaName: string;
    contentsIds: string[];
  }) => Promise<void>;

  getContents: (getContentsOptions: {
    projectName: string;
    schemaName: string;
    pagination?: {
      page?: number;
      pageLength?: number;
    };
    sort?: {
      [key: string]: "asc" | "desc" | "ascending" | "descending";
    }[];
    filter?: {
      [key: string]: string | number | boolean | ObjectId;
    };
  }) => Promise<WithId<Document>[]>;
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
      await this.client.db(projectName).createCollection(jsonSchema.title);
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

  async createContents({
    projectName,
    schemaName,
    contents,
  }: {
    projectName: string;
    schemaName: string;
    contents: { [key: string]: string };
  }) {
    try {
      return this.client
        .db(projectName)
        .collection(schemaName)
        .insertOne(contents);
    } catch (error) {
      throw error;
    }
  }

  async updateContents({
    projectName,
    schemaName,
    contentsId,
    contents,
  }: {
    projectName: string;
    schemaName: string;
    contentsId: string;
    contents: unknown;
  }) {
    try {
      await this.client
        .db(projectName)
        .collection(schemaName)
        .updateOne({ _id: new ObjectId(contentsId) }, { $set: contents });
    } catch (error) {
      throw error;
    }
  }

  async deleteContents({
    projectName,
    schemaName,
    contentsIds,
  }: {
    projectName: string;
    schemaName: string;
    contentsIds: string[];
  }) {
    try {
      await Promise.allSettled(
        contentsIds.map(contentsId =>
          this.client
            .db(projectName)
            .collection(schemaName)
            .deleteOne({ _id: new ObjectId(contentsId) }),
        ),
      );
    } catch (error) {
      throw error;
    }
  }

  async getContents({
    projectName,
    schemaName,
    pagination,
    sort,
    filter,
  }: {
    projectName: string;
    schemaName: string;
    pagination?: {
      page?: number;
      pageLength?: number;
    };
    sort?: {
      [key: string]: "asc" | "desc" | "ascending" | "descending";
    }[];
    filter?: {
      [key: string]: string | number | boolean | ObjectId;
    };
  }) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.pageLength || Config.MAX_NUMBER_PER_PAGE;
    const skip = (page - 1) * limit;
    const sortOptions = sort
      ? sort.reduce((sortOptions, option) => {
          const sortOrders = Object.values(option).map(order =>
            order === "asc" || order === "ascending" ? 1 : -1,
          );
          const sortProps = Object.keys(option).reduce(
            (sortOperators, prop, index) => ({
              ...sortOperators,
              [prop]: sortOrders[index],
            }),
            {},
          );
          return {
            ...sortOptions,
            ...sortProps,
          };
        }, {})
      : {};
    const filterOptions = filter ?? {};

    return this.client
      .db(projectName)
      .collection(schemaName)
      .find(filterOptions, {
        limit,
        skip,
      })
      .sort(sortOptions)
      .toArray();
  }
}

import { injectable } from "inversify";
import { MongoClient, ObjectId } from "mongodb";
import { ContentClient } from "../@config/di.config";

import Config from "../@config";

import type { Content } from "../@types/content";

@injectable()
export class MongodbContentClient implements ContentClient {
  private static _client: MongoClient | null = null;

  private get client(): MongoClient {
    if (!MongodbContentClient._client) {
      throw new Error(
        "The connection to the content database was not established.",
      );
    }

    return MongodbContentClient._client;
  }

  public static async connect() {
    MongodbContentClient._client = new MongoClient(
      Config.CONTENTS_DATABASE_URL,
    );

    try {
      await MongodbContentClient._client.connect();
    } catch (error) {
      throw error;
    }
  }

  public static async close() {
    await MongodbContentClient._client?.close();

    MongodbContentClient._client = null;
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

  async createContent({
    projectName,
    schemaName,
    content,
  }: {
    projectName: string;
    schemaName: string;
    content: Omit<Content, "_id">;
  }) {
    try {
      const result = await this.client
        .db(projectName)
        .collection(schemaName)
        .insertOne(content);

      return result.insertedId.toString();
    } catch (error) {
      throw error;
    }
  }

  async updateContent({
    projectName,
    schemaName,
    contentId,
    content,
  }: {
    projectName: string;
    schemaName: string;
    contentId: string;
    content: Partial<Content>;
  }) {
    try {
      await this.client
        .db(projectName)
        .collection(schemaName)
        .findOneAndUpdate({ _id: new ObjectId(contentId) }, { $set: content });
    } catch (error) {
      throw error;
    }
  }

  async deleteContent({
    projectName,
    schemaName,
    contentIds,
  }: {
    projectName: string;
    schemaName: string;
    contentIds: string[];
  }) {
    try {
      await Promise.allSettled(
        contentIds.map(contentId =>
          this.client
            .db(projectName)
            .collection(schemaName)
            .deleteOne({ _id: new ObjectId(contentId) }),
        ),
      );
    } catch (error) {
      throw error;
    }
  }

  async queryContents({
    projectName,
    schemaName,
    pagination,
    sort,
    filter,
  }: {
    projectName: string;
    schemaName: string;
    pagination?: {
      page: number;
      pageLength: number;
    };
    sort?: Record<string, "asc" | "ascending" | "desc" | "descending">;
    filter?: {
      [key: string]: string | number | boolean;
    };
  }) {
    if (!!filter?.id && typeof filter.id === "string") {
      const content = await this.client
        .db(projectName)
        .collection(schemaName)
        .findOne<Content>({ _id: new ObjectId(filter.id) });

      return [content];
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.pageLength || Config.MAX_NUMBER_PER_PAGE;
    const skip = (page - 1) * limit;
    const filterOptions = filter ?? {};
    const sortOptions = sort ?? {};

    return this.client
      .db(projectName)
      .collection(schemaName)
      .find<Content>(filterOptions, {
        limit,
        skip,
      })
      .sort(sortOptions)
      .toArray();
  }

  async getContentsTotalCount({
    projectName,
    schemaName,
    filter,
  }: {
    projectName: string;
    schemaName: string;
    filter?: {
      [key: string]: string | number | boolean;
    };
  }) {
    return this.client
      .db(projectName)
      .collection(schemaName)
      .countDocuments({ filter });
  }
}

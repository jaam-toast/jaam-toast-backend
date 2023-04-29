import { injectable } from "inversify";
import { MongoClient, ObjectId } from "mongodb";
import { DatabaseClient } from "../config/di.config";

import Config from "../config";

@injectable()
export class MongodbDatabaseClient implements DatabaseClient {
  private static _client: MongoClient | null = null;

  get client(): MongoClient {
    if (!MongodbDatabaseClient._client) {
      throw new Error(
        "The connection to the contents database was not established.",
      );
    }

    return MongodbDatabaseClient._client;
  }

  static async connect() {
    MongodbDatabaseClient._client = new MongoClient(
      Config.CONTENTS_DATABASE_URL,
    );

    try {
      await MongodbDatabaseClient._client.connect();
    } catch (error) {
      throw error;
    }
  }

  static async close() {
    await MongodbDatabaseClient._client?.close();

    MongodbDatabaseClient._client = null;
  }

  async create<Document extends { [key: string]: unknown }>({
    collectionName,
    document,
    dbName,
  }: {
    dbName: string;
    collectionName: string;
    document: Document | Document[];
  }) {
    try {
      if (!Array.isArray(document)) {
        const { insertedId } = await this.client
          .db(dbName)
          .collection(collectionName)
          .insertOne(document);
        const documentId = insertedId.toString();

        return [documentId];
      }

      const { insertedIds } = await this.client
        .db(dbName)
        .collection(collectionName)
        .insertMany(document);
      const documentId = Object.values(insertedIds).map(insertedId =>
        insertedId.toString(),
      );

      return documentId;
    } catch (error) {
      throw error;
    }
  }

  async read<Document extends { [key: string]: unknown }>({
    dbName,
    collectionName,
    id,
    filter,
  }: {
    dbName: string;
    collectionName: string;
    id?: string | string[];
    filter?: { [key: string]: string };
  }): Promise<(Document | null)[]> {
    if (!!id && !!filter) {
      throw new Error("Choose the one database option.");
    }

    try {
      if (Array.isArray(id)) {
        const documents = await Promise.all(
          id.map(documentId =>
            this.client
              .db(dbName)
              .collection(collectionName)
              .findOne<Document>({ _id: new ObjectId(documentId) }),
          ),
        );

        return documents;
      }

      if (typeof id === "string") {
        const document = !!id
          ? await this.client
              .db(dbName)
              .collection(collectionName)
              .findOne<Document>({ _id: new ObjectId(id) })
          : null;

        return [document];
      }

      const queryFilter = filter ?? {};
      const documents = await this.client
        .db(dbName)
        .collection(collectionName)
        .find<Document>(queryFilter)
        .toArray();

      return documents;
    } catch (error) {
      throw error;
    }
  }

  async update<Document extends { [key: string]: unknown }>({
    dbName,
    collectionName,
    id,
    filter,
    document,
  }: {
    dbName: string;
    collectionName: string;
    id?: string | string[];
    filter?: { [key: string]: string };
    document: Partial<Document>;
  }) {
    if ((!!id && !!filter) || (!id && !filter)) {
      throw new Error("Choose the one database option.");
    }

    try {
      if (typeof id === "string") {
        await this.client
          .db(dbName)
          .collection(collectionName)
          .updateOne({ _id: new ObjectId(id) }, { $set: document });

        return;
      }

      if (Array.isArray(id)) {
        await Promise.allSettled(
          id.map(id =>
            this.client
              .db(dbName)
              .collection(collectionName)
              .updateOne({ _id: new ObjectId(id) }, { $set: document }),
          ),
        );

        return;
      }

      if (!!filter) {
        this.client
          .db(dbName)
          .collection(collectionName)
          .updateMany(filter, { $set: document });

        return;
      }
    } catch (error) {
      throw error;
    }
  }

  async delete({
    dbName,
    collectionName,
    id,
    filter,
  }: {
    dbName: string;
    collectionName: string;
    id?: string | string[];
    filter?: { [key: string]: string };
  }) {
    if ((!!id && !!filter) || (!id && !filter)) {
      throw new Error("Choose the one database option.");
    }

    try {
      if (Array.isArray(id)) {
        await Promise.allSettled(
          id.map(documentId =>
            this.client
              .db(dbName)
              .collection(collectionName)
              .deleteOne({ _id: new ObjectId(documentId) }),
          ),
        );

        return;
      }

      if (typeof id === "string") {
        await this.client
          .db(dbName)
          .collection(collectionName)
          .deleteOne({ _id: new ObjectId(id) });

        return;
      }

      if (!!filter) {
        await this.client
          .db(dbName)
          .collection(collectionName)
          .deleteMany(filter);

        return;
      }
    } catch (error) {
      throw error;
    }
  }
}

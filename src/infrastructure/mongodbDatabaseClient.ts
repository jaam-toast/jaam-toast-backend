import { injectable } from "inversify";
import { MongoClient, ObjectId } from "mongodb";

import Config from "../config";

export interface DatabaseClient {
  create: <Document extends { [key: string]: unknown }>({
    collectionName,
    documents,
  }: {
    collectionName: string;
    documents: Document | Document[];
  }) => Promise<string[]>;

  read: <Document extends { [key: string]: unknown }>({
    collectionName,
    documentId,
  }: {
    collectionName: string;
    documentId: string | string[];
  }) => Promise<(Document | null)[]>;

  update: <Document extends { [key: string]: unknown }>({
    collectionName,
    documentId,
    document,
  }: {
    collectionName: string;
    documentId: string;
    document: Document;
  }) => Promise<string>;

  delete: ({
    collectionName,
    documentIds,
  }: {
    collectionName: string;
    documentIds: string | string[];
  }) => Promise<void>;
}

@injectable()
export class mongodbDatabaseClient implements DatabaseClient {
  private static _client: MongoClient | null = null;

  get client(): MongoClient {
    if (!mongodbDatabaseClient._client) {
      throw new Error(
        "The connection to the contents database was not established.",
      );
    }

    return mongodbDatabaseClient._client;
  }

  static async connect() {
    mongodbDatabaseClient._client = new MongoClient(
      Config.CONTENTS_DATABASE_URL,
    );

    try {
      await mongodbDatabaseClient._client.connect();
    } catch (error) {
      throw error;
    }
  }

  static async close() {
    await mongodbDatabaseClient._client?.close();

    mongodbDatabaseClient._client = null;
  }

  async create<Document extends { [key: string]: unknown }>({
    collectionName,
    documents,
  }: {
    collectionName: string;
    documents: Document | Document[];
  }) {
    if (!Array.isArray(documents)) {
      try {
        const { insertedId } = await this.client
          .db(Config.APP_DB_NAME)
          .collection(collectionName)
          .insertOne(documents);
        const documentId = insertedId.toString();

        return [documentId];
      } catch (error) {
        throw error;
      }
    }

    try {
      const { insertedIds } = await this.client
        .db(Config.APP_DB_NAME)
        .collection(collectionName)
        .insertMany(documents);
      const documentIds = Object.values(insertedIds).map(insertedId =>
        insertedId.toString(),
      );

      return documentIds;
    } catch (error) {
      throw error;
    }
  }

  async read<Document extends { [key: string]: unknown }>({
    collectionName,
    documentId,
  }: {
    collectionName: string;
    documentId: string | string[];
  }): Promise<(Document | null)[]> {
    if (!Array.isArray(documentId)) {
      try {
        const document = await this.client
          .db(Config.APP_DB_NAME)
          .collection(collectionName)
          .findOne<Document>({ _id: new ObjectId(documentId) });

        return [document];
      } catch (error) {
        throw error;
      }
    }

    try {
      const documents = await Promise.all(
        documentId.map(documentId =>
          this.client
            .db(Config.APP_DB_NAME)
            .collection(collectionName)
            .findOne<Document>({ _id: new ObjectId(documentId) }),
        ),
      );

      return documents;
    } catch (error) {
      throw error;
    }
  }

  async update<Document extends { [key: string]: unknown }>({
    collectionName,
    documentId,
    document,
  }: {
    collectionName: string;
    documentId: string;
    document: Document;
  }) {
    try {
      const { upsertedId } = await this.client
        .db(Config.APP_DB_NAME)
        .collection(collectionName)
        .updateOne({ _id: new ObjectId(documentId) }, { $set: document });
      const updatedDocumentId = upsertedId.toString();

      return updatedDocumentId;
    } catch (error) {
      throw error;
    }
  }

  async delete({
    collectionName,
    documentIds,
  }: {
    collectionName: string;
    documentIds: string | string[];
  }) {
    if (!Array.isArray(documentIds)) {
      try {
        await this.client
          .db(Config.APP_DB_NAME)
          .collection(collectionName)
          .deleteOne({ _id: new ObjectId(documentIds) });

        return;
      } catch (error) {
        throw error;
      }
    }

    try {
      await Promise.allSettled(
        documentIds.map(documentId =>
          this.client
            .db(Config.APP_DB_NAME)
            .collection(collectionName)
            .deleteOne({ _id: new ObjectId(documentId) }),
        ),
      );

      return;
    } catch (error) {
      throw error;
    }
  }
}

import { inject, injectable } from "inversify";

import Config from "../../@config";

import type { User } from "../../@types/user";
import type { DatabaseClient, Repository } from "../../@config/di.config";

@injectable()
export class UserRepository implements Repository<User> {
  private databaseClient: DatabaseClient;

  constructor(
    @inject("MongodbDatabaseClient") mongodbDatabaseClient: DatabaseClient,
  ) {
    this.databaseClient = mongodbDatabaseClient;
  }

  public createDocument({ document }: { document: Omit<User, "_id"> }) {
    return this.databaseClient.create<Omit<User, "_id">>({
      dbName: Config.APP_DB_NAME,
      collectionName: "users",
      document,
    });
  }

  public readDocument({
    documentId,
    filter,
  }: {
    documentId?: string;
    filter?: { [key: string]: string | number | boolean };
  }) {
    return this.databaseClient.read<User>({
      dbName: Config.APP_DB_NAME,
      collectionName: "users",
      ...(documentId && { id: documentId }),
      ...(filter && { filter }),
    });
  }

  public updateDocument({
    documentId,
    document,
  }: {
    documentId: string;
    document: Partial<User>;
  }) {
    return this.databaseClient.update<User>({
      dbName: Config.APP_DB_NAME,
      collectionName: "users",
      id: documentId,
      document,
    });
  }

  public deleteDocument({ documentId }: { documentId: string }) {
    return this.databaseClient.delete({
      dbName: Config.APP_DB_NAME,
      collectionName: "users",
      filter: { id: documentId },
    });
  }
}

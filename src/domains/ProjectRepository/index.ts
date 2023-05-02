import { inject, injectable } from "inversify";

import Config from "../../@config";

import type { Project } from "../../@types/project";
import type { DatabaseClient, Repository } from "../../@config/di.config";

@injectable()
export class ProjectRepository implements Repository<Project> {
  private databaseClient: DatabaseClient;

  constructor(
    @inject("MongodbDatabaseClient") mongodbDatabaseClient: DatabaseClient,
  ) {
    this.databaseClient = mongodbDatabaseClient;
  }

  public createDocument({ document }: { document: Project }) {
    return this.databaseClient.create<Project>({
      dbName: Config.APP_DB_NAME,
      collectionName: "projects",
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
    return this.databaseClient.read<Project>({
      dbName: Config.APP_DB_NAME,
      collectionName: "projects",
      ...(documentId && { filter: { projectName: documentId } }),
      ...(filter && { filter }),
    });
  }

  public updateDocument({
    documentId,
    document,
  }: {
    documentId: string;
    document: Partial<Project>;
  }) {
    return this.databaseClient.update<Project>({
      dbName: Config.APP_DB_NAME,
      collectionName: "projects",
      filter: { projectName: documentId },
      document,
    });
  }

  public deleteDocument({ documentId }: { documentId: string }) {
    return this.databaseClient.delete({
      dbName: Config.APP_DB_NAME,
      collectionName: "projects",
      filter: { projectName: documentId },
    });
  }
}

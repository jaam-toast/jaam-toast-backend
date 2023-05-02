import type { Env, Framework, ProjectStatus } from "../@types/project";
import type { Schema } from "../@types/schema";
import type { BaseEvent } from "../@types/baseEvent";

export type Events =
  | CreateProjectEvent
  | ProjectCreatedEvent
  | ProjectCreationErrorEvent
  | CreateStorageEvent
  | StorageCreatedEvent
  | SchemaCreatedEvent
  | SchemaUpdatedEvent
  | SchemaDeletedEvent;

export type CreateProjectEvent = BaseEvent<
  "CREATE_PROJECT",
  {
    userId: string;
    space: string;
    repoName: string;
    repoCloneUrl: string;
    projectName: string;
    framework: Framework;
    nodeVersion?: string;
    installCommand: string;
    buildCommand: string;
    envList: Env[];
    storageKey: string;
    schemaList: {
      schemaName: string;
      schema: Schema;
    }[];
    status: ProjectStatus;
  }
>;

export type ProjectCreatedEvent = BaseEvent<
  "PROJECT_CREATED",
  {
    projectName: string;
    jaamToastDomain: string;
    originalBuildDomain: string;
    resourcePath: string;
  }
>;

export type ProjectCreationErrorEvent = BaseEvent<
  "PROJECT_CREATION_ERROR",
  {
    projectName: string;
    message: string;
  }
>;

export type CreateStorageEvent = BaseEvent<
  "CREATE_STORAGE",
  {
    projectName: string;
  }
>;

export type StorageCreatedEvent = BaseEvent<
  "STORAGE_CREATED",
  {
    storageDomain: string;
  }
>;

export type SchemaCreatedEvent = BaseEvent<
  "SCHEMA_CREATED",
  {
    projectName: string;
    schemaList: {
      schemaName: string;
      schema: Schema;
    }[];
  }
>;

export type SchemaUpdatedEvent = BaseEvent<
  "SCHEMA_UPDATED",
  {
    projectName: string;
    schemaList: {
      schemaName: string;
      schema: Schema;
    }[];
  }
>;

export type SchemaDeletedEvent = BaseEvent<
  "SCHEMA_DELETED",
  {
    projectName: string;
    schemaList: {
      schemaName: string;
      schema: Schema;
    }[];
  }
>;

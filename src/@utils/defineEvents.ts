import type { Env, Framework, ProjectStatus, Webhook } from "../@types/project";
import type { Schema } from "../@types/schema";
import type { BaseEvent } from "../@types/baseEvent";
import type { S3CloudFrontDeploymentData } from "../infrastructure/S3CloudFrontDeploymentClient";

export type Events =
  | CreateProjectEvent
  | UpdateProjectEvent
  | AddProjectOptionsEvent
  | RemoveProjectOptionsEvent
  | DeploymentUpdatedEvent
  | DeploymentErrorEvent
  | StorageCreatedEvent
  | SchemaCreatedEvent
  | SchemaUpdatedEvent
  | SchemaDeletedEvent
  | ContentCreatedEvent
  | ContentUpdatedEvent
  | ContentDeletedEvent;

export type CreateProjectEvent = BaseEvent<
  "CREATE_PROJECT",
  {
    userId: string;
    space: string;
    repoName: string;
    repoCloneUrl: string;
    projectName: string;
    framework: Framework;
    nodeVersion: string;
    installCommand: string;
    buildCommand: string;
    envList: Env[];
    storageKey: string;
    status: ProjectStatus;
  }
>;

export type UpdateProjectEvent = BaseEvent<
  "UPDATE_PROJECT",
  {
    projectName: string;
    isRedeployUpdate?: boolean;
    repoCloneUrl?: string;
    userId?: string;
    installCommand?: string;
    buildCommand?: string;
    envList?: Env | Env[];
  }
>;

export type AddProjectOptionsEvent = BaseEvent<
  "ADD_PROJECT_OPTIONS",
  {
    projectName: string;
    customDomain?: string;
    webhook?: { webhookId?: string } & Omit<Webhook, "webhookId">;
  }
>;

export type RemoveProjectOptionsEvent = BaseEvent<
  "REMOVE_PROJECT_OPTIONS",
  {
    projectName: string;
    customDomain?: string;
    webhookIds?: string[];
  }
>;

export type DeploymentUpdatedEvent = BaseEvent<
  "DEPLOYMENT_UPDATED",
  {
    projectName: string;
    originalBuildDomain?: string;
    jaamToastDomain?: string;
    resourcePath?: string;
    deploymentData?: S3CloudFrontDeploymentData;
  }
>;

export type DeploymentErrorEvent = BaseEvent<
  "DEPLOYMENT_ERROR",
  {
    projectName: string;
    error: Error;
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
    schemaName: string;
    schema: Schema;
  }
>;

export type SchemaUpdatedEvent = BaseEvent<
  "SCHEMA_UPDATED",
  {
    projectName: string;
    schemaName: string;
    schema: Schema;
  }
>;

export type SchemaDeletedEvent = BaseEvent<
  "SCHEMA_DELETED",
  {
    projectName: string;
    schemaName: string;
  }
>;

export type ContentCreatedEvent = BaseEvent<
  "CONTENT_CREATED",
  {
    projectName: string;
    schema: Schema;
    content: { [key: string]: unknown };
  }
>;

export type ContentUpdatedEvent = BaseEvent<
  "CONTENT_UPDATED",
  {
    projectName: string;
    schema: Schema;
    content: { [key: string]: unknown };
  }
>;

export type ContentDeletedEvent = BaseEvent<
  "CONTENT_DELETED",
  {
    projectName: string;
    schema: Schema;
  }
>;

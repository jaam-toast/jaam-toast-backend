import type { Schema } from "./schema";
import type { S3CloudFrontDeploymentData } from "../infrastructure/S3CloudFrontDeploymentClient";

export type Framework =
  | "CreateReactApp"
  | "ReactStatic"
  | "NextJs"
  | "NuxtJs"
  | "Angular"
  | "Astro"
  | "Gatsby"
  | "GitBook"
  | "Jekyll"
  | "Remix"
  | "Svelte"
  | "Vue"
  | "VuePress";

export type Env = {
  key: string;
  value: string;
};

export enum ProjectStatus {
  Pending = "PENDING",
  Ready = "READY",
  Fail = "FAIL",
}

export type WebhookEvents =
  | "DEPLOYMENT_UPDATED"
  | "CONTENT_CREATED"
  | "CONTENT_UPDATED"
  | "CONTENT_DELETED";

export type Webhook = {
  webhookId: string;
  name: string;
  url: string;
  events: WebhookEvents[];
};

export type Project = {
  _id: string;
  projectName: string;
  status: ProjectStatus;
  projectUpdatedAt: string;
  deploymentData: S3CloudFrontDeploymentData;

  space: string;
  repoName: string;
  repoCloneUrl: string;
  framework: Framework;
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  envList: Env[];

  storageKey: string;
  schemaList: {
    schemaName: string;
    schema: Schema;
  }[];
  webhookList: Webhook[];
  jaamToastDomain?: string;
  originalBuildDomain?: string;
  customDomain: string[];
  cmsDomain?: string;
  assetStorageUrl?: string;
};

import { Types } from "mongoose";

export interface Env {
  key: string;
  value: string;
}

export interface User {
  _id: Types.ObjectId;
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken?: string;
  myRepos?: Types.ObjectId[];
}

export interface Project {
  _id: Types.ObjectId;
  repoName: string;
  repoOwner: string;
  repoCloneUrl: string;
  repoUpdatedAt: string;
  nodeVersion: string;
  recordId?: string;
  webhookId?: string;
  subdomain?: string;
  userId?: string;
  buildType: string;
}

export interface Deployment {
  installCommand: string;
  buildCommand: string;
  envList?: Env[];
  instanceId: string;
  deployedUrl?: string;
  buildingLog?: (string | undefined)[] | undefined;
  lastCommitMessage?: string;
  publicIpAddress?: string;
}

export type Next = Function;

export type ServiceHandler<T> = (
  service: T,
  next: Next,
) => void | Promise<void>;

export type LogMessage = string;

export enum LogType {
  Server,
  Request,
  Deployment,
  Error,
}

// TEMP
export type Repo = Project & Deployment;

export type RedeployOptions = {
  repoCloneUrl: string;
  lastCommitMessage: string;
  repoName: string;
};

export type ProjectDeleteOptions = {
  instanceId?: string;
  subdomain?: string;
  publicIpAddress?: string;
  userId?: string;
  repoId?: Types.ObjectId;
};

export type BuildOptions = {
  repoName: string;
  repoCloneUrl: string;
  repoUpdatedAt: string;
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  envList: Env[];
  buildType: string;
  githubAccessToken: string;
  userId: string;
};

// export interface ClientOptions {
//   repoName: string;
//   repoOwner: string;
//   repoCloneUrl: string;
//   repoUpdatedAt: string;
// }

// export interface GitMetadata {
//   commitAuthorName?: string | undefined;
//   commitMessage?: string | undefined;
//   repoCloneUrl: string;
// }

// export interface DeploymentOptions {
//   nodeVersion: string;
//   installCommand: string;
//   buildCommand: string;
//   envList?: Env[];
//   buildType: string;
//   gitMetadata?: GitMetadata;
// }

// export interface RepoBuildOptions extends ClientOptions, DeploymentOptions {}

// export interface DeploymentData extends RepoBuildOptions {
//   instanceId: string;
//   deployedUrl?: string;
//   recordId?: string;
//   buildingLog?: (string | undefined)[] | undefined;
//   lastCommitMessage?: string;
//   webhookId?: string;
//   repoId?: Types.ObjectId;
//   publicIpAddress?: string;
//   githubAccessToken?: string;
// }

// interface ChangeDNSRecordProps {
//   actionType: string;
//   subdomain: string;
//   recordValue: string;
//   recordType: RRType;
//   instanceId?: string;
// }

// interface RecordSetResponse {
//   recordId: string | undefined;
//   recordStatus: string | undefined;
//   recordCreatedAt: Date | undefined;
//   publicIpAddress?: string | undefined;
// }

// interface RecordInstaceStatus {
//   recordStatus: string | undefined;
//   instanceState: string | undefined;
// }

import {
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
  ObjectId,
} from "mongodb";
import { Env } from ".";

export type StreamType =
  | ChangeStreamInsertDocument<Project>
  | ChangeStreamUpdateDocument<Project>;

export type User = {
  _id?: ObjectId;
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken?: string;
  projects?: ObjectId[];
};

export type Project = {
  _id?: ObjectId;
  space: string;
  repoName: string;
  repoCloneUrl: string;
  projectUpdatedAt: string;
  projectName: string;
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  buildType: string;
  envList: Env[];
  webhookId: number;
  lastCommitMessage: string;
  lastCommitHash: string;
  deployments?: ObjectId[];
  instanceId?: string;
  recordId?: string;
  deployedUrl?: string;
  publicIpAddress?: string;
  status?: string;
};

export type Deployment = {
  _id?: ObjectId;
  buildingLog?: (string | undefined)[] | undefined;
  deployStatus?: string;
  lastCommitMessage?: string;
  lastCommitHash?: string;
  projectUpdatedAt?: string;
};

export type IdParameter = ObjectId | string;

export type UserOptions = {
  username?: string;
  userGithubUri?: string;
  userImage?: string;
  githubAccessToken?: string;
  projects?: ObjectId[];
};

export type ProjectOptions = {
  space?: string;
  repoName?: string;
  repoCloneUrl?: string;
  projectUpdatedAt?: string;
  projectName?: string;
  nodeVersion?: string;
  installCommand?: string;
  buildCommand?: string;
  buildType?: string;
  envList?: Env[];
  deployments?: ObjectId[];
  webhookId?: number;
  lastCommitMessage?: string;
  lastCommitHash?: string;
  instanceId?: string;
  recordId?: string;
  deployedUrl?: string;
  publicIpAddress?: string;
};

export type DeploymentOptions = {
  buildingLog?: (string | undefined)[] | undefined;
  deployStatus?: string;
  lastCommitMessage?: string;
  lastCommitHash?: string;
  repoUpdatedAt?: string;
};

/** Project Service Type */
export type CreateProjectUserOptions = {
  userId: string;
  githubAccessToken: string;
};

export type CreateProjectDefaultOptions = {
  space: string;
  repoName: string;
  repoCloneUrl: string;
  projectName: string;
  projectUpdatedAt?: string;
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  buildType: string;
  envList: Env[];
  webhookId?: number;
};

export type CreateProjectOptions = CreateProjectUserOptions &
  CreateProjectDefaultOptions;

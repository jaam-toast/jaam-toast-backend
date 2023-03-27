import {
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
} from "mongodb";
import { Types } from "mongoose";
import { Env } from ".";

export type StreamType =
  | ChangeStreamInsertDocument<Project>
  | ChangeStreamUpdateDocument<Project>;

export type User = {
  _id?: Types.ObjectId;
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken?: string;
  projects?: Types.ObjectId[];
};

export type Project = {
  _id?: Types.ObjectId;
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
  deployments?: Types.ObjectId[];
  instanceId?: string;
  recordId?: string;
  deployedUrl?: string;
  publicIpAddress?: string;
  status?: string;
};

export type Deployment = {
  _id?: Types.ObjectId;
  buildingLog?: (string | undefined)[] | undefined;
  deployStatus?: string;
  lastCommitMessage?: string;
  lastCommitHash?: string;
  projectUpdatedAt?: string;
};

export type IdParameter = Types.ObjectId | string;

export type UserOptions = {
  username?: string;
  userGithubUri?: string;
  userImage?: string;
  githubAccessToken?: string;
  projects?: Types.ObjectId[];
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
  deployments?: Types.ObjectId[];
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

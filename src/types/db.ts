import { Types } from "mongoose";
import { Env } from ".";

export interface User {
  _id?: Types.ObjectId;
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken?: string;
  projects?: Types.ObjectId[];
}

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
  deployments?: Types.ObjectId[];
  lastCommitMessage: string;
  lastCommitHash: string;
  webhookId: number;
  instanceId?: string;
  deployedUrl?: string;
  publicIpAddress?: string;
};

export type Deployment = {
  _id?: Types.ObjectId;
  buildingLog: (string | undefined)[] | undefined;
  deployedStatus: string;
  lastCommitMessage: string;
  lastCommitHash: string;
  repoUpdatedAt?: string;
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
  lastCommitMessage?: string;
  lastCommitHash?: string;
  webhookId?: number;
  instanceId?: string;
  deployedUrl?: string;
  publicIpAddress?: string;
};

export type DeploymentOptions = {
  buildingLog?: (string | undefined)[] | undefined;
  deployedStatus?: string;
  lastCommitMessage?: string;
  lastCommitHash?: string;
  repoUpdatedAt?: string;
};

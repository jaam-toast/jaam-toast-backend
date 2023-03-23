import { Types } from "mongoose";

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
  space?: string;
  repoName: string;
  repoCloneUrl: string;
  repoUpdatedAt: string;
  projectName: string;
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  buildType: string;
  envList: string;
  deployments: Types.ObjectId[];
  instanceId?: string;
  deployedUrl?: string;
  lastCommitMessage?: string;
  lastCommitHash?: string;
  webhookId?: string;
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

export type ProjectProperty = {
  space?: string;
  repoName?: string;
  repoCloneUrl?: string;
  repoUpdatedAt?: string;
  projectName?: string;
  nodeVersion?: string;
  installCommand?: string;
  buildCommand?: string;
  buildType?: string;
  envList?: string;
  instanceId?: string;
  deployedUrl?: string;
  lastCommitMessage?: string;
  lastCommitHash?: string;
  webhookId?: string;
  deployments?: Types.ObjectId[];
  publicIpAddress?: string;
};

export type UserProperty = {
  username?: string;
  userGithubUri?: string;
  userImage?: string;
  githubAccessToken?: string;
  projects?: Types.ObjectId[];
};

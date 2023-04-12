import { Types } from "mongoose";

type Env = {
  key: string;
  value: string;
};

export enum ProjectStatus {
  pending,
  success,
  fail,
}

export type BaseProject = {
  space: string;
  repoName: string;
  repoCloneUrl: string;
  projectName: string;
  projectUpdatedAt: string;

  framework: string;
  installCommand: string;
  buildCommand: string;
  envList: Env[];
};

export type OptionalProject = {
  buildUrl?: string;
  cmsUrl?: string;

  schemaList?: string[];
  contentList?: string[];
  assetStorageUrl?: string;

  webhookId?: number;
  lastCommitMessage?: string;
  lastCommitHash?: string;

  status?: ProjectStatus.pending | ProjectStatus.success | ProjectStatus.fail;
};

export type Project = { _id?: Types.ObjectId | string } & BaseProject &
  OptionalProject;

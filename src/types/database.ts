import { Types } from "mongoose";

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
  _id?: string;
  space?: string;
  repoName: string;
  repoCloneUrl: string;
  projectName: string;
  projectUpdatedAt?: string;

  framework: Framework;
  nodeVersion?: string;
  installCommand: string;
  buildCommand: string;
  envList: Env[];
};

export type OptionalProject = {
  buildDomain?: string;
  buildOriginalDomain?: string;
  cmsDomain?: string;
  cmsToken?: string;

  schemaList: {
    schemaName: string;
    schema: {};
  }[];
  contentList?: string[];
  assetStorageUrl?: string;

  webhookId?: number;
  lastCommitMessage?: string;
  lastCommitHash?: string;

  status?: ProjectStatus.pending | ProjectStatus.success | ProjectStatus.fail;
};

export type Project = { _id?: Types.ObjectId | string } & BaseProject &
  OptionalProject;

export type IdParameter = Types.ObjectId | string;

export type User = {
  _id?: Types.ObjectId | string;
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken: string;
  projects?: string[];
};

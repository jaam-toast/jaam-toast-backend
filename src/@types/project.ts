import { Schema } from "./schema";

export type Project = {
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
  storageKey: string;

  buildDomain?: string[];
  originalBuildDomain?: string;
  cmsDomain?: string;
  cmsToken?: string;

  schemaList: {
    schemaName: string;
    schema: Schema;
  }[];
  contentList?: string[];
  assetStorageUrl?: string;

  webhookId?: number;
  lastCommitMessage?: string;
  lastCommitHash?: string;

  status?: ProjectStatus;
};

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
  pending = "pending",
  success = "success",
  fail = "fail",
}

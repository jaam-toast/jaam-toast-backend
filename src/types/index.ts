import { Types } from "mongoose";
import { Env } from "./custom";

export interface User {
  _id: Types.ObjectId;
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken?: string;
  myRepos?: Types.ObjectId[];
}

export interface Repo {
  _id: Types.ObjectId;
  repoName: string;
  repoOwner: string;
  repoCloneUrl: string;
  repoUpdatedAt: string;
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  buildType: string;
  envList?: Env[];
  instanceId: string;
  deployedUrl?: string;
  recordId?: string;
  buildingLog?: (string | undefined)[] | undefined;
  lastCommitMessage?: string;
  webhookId?: string;
  subdomain?: string;
  publicIpAddress?: string;
  userId?: string;
}

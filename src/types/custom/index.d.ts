import { RRType, Date } from "@aws-sdk/client-route-53";
import { Types } from "mongoose";

export interface UserType {
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken?: string;
  myRepos?: Types.ObjectId[];
}

export interface ClientOptions {
  repoName: string;
  repoOwner: string;
  repoCloneUrl: string;
  repoUpdatedAt: string;
}

export interface Env {
  key: string;
  value: string;
}

export interface GitMetadata {
  commitAuthorName?: string | undefined;
  commitMessage?: string | undefined;
  repoCloneUrl: string;
}

export interface DeploymentOptions {
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  envList?: Env[];
  buildType: string;
  gitMetadata?: GitMetadata;
}

export interface RepoBuildOptions extends ClientOptions, DeploymentOptions {}

export interface DeploymentData extends RepoBuildOptions {
  instanceId: string;
  deployedUrl?: string;
  recordId?: string;
  buildingLog?: (string | undefined)[] | undefined;
  lastCommitMessage?: string;
  webhookId?: string;
  repoId?: Types.ObjectId;
  publicIpAddress?: string;
  githubAccessToken?: string;
}

interface ChangeDNSRecordProps {
  actionType: string;
  subdomain: string;
  recordValue: string;
  recordType: RRType;
  instanceId?: string;
}

interface RecordSetResponse {
  recordId: string | undefined;
  recordStatus: string | undefined;
  recordCreatedAt: Date | undefined;
  publicIpAddress?: string | undefined;
}

interface RecordInstaceStatus {
  recordStatus: string | undefined;
  instanceState: string | undefined;
}

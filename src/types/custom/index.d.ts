import { RRType, Date } from "@aws-sdk/client-route-53";

export type User = {
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken?: string;
};

export interface ClientOptions {
  repoCloneUrl: string;
  repoName: string;
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
  installCommand?: string;
  buildCommand?: string;
  envList?: Env[];
  gitMetadata?: GitMetadata;
}

export interface RepoBuildOptions extends ClientOptions, DeploymentOptions {}

interface CreateDNSRecordProps {
  subdomain: string;
  recordValue: string;
  recordType: RRType;
}

interface RecordSetResponse {
  recordId: string | undefined;
  recordStatus: string | undefined;
  recordCreatedAt: Date | undefined;
}

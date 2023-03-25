export interface Env {
  key: string;
  value: string;
}

export type Next = Function;

export type ServiceHandler<T> = (
  service: T,
  next: Next,
) => void | Promise<void>;

export type LogMessage = string;

export enum LogType {
  Server,
  Request,
  Deployment,
  Error,
}

export type BuildOptions = {
  userId?: string;
  space: string;
  repoName: string;
  repoCloneUrl: string;
  projectUpdatedAt: string;
  projectName: string;
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  envList: Env[];
  buildType: string;
  githubAccessToken?: string | QueryString.ParsedQs;
};

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
  projectId?: string;
  deploymentId?: string;
  subdomain?: string;
  space?: string;
  repoCloneUrl?: string;
  repoName?: string;
  nodeVersion?: string;
  installCommand?: string;
  buildCommand?: string;
  buildType?: string;
  envList?: Env[];
};

export type DeleteBuildOptions = {
  subdomain: string;
  instanceId: string;
  publicIpAddress: string;
};

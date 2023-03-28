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

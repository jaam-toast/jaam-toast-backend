export type User = {
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken?: string;
};

export interface ClientOptions {
  remoteUrl: string;
  repoName: string;
}

export interface Env {
  key: string;
  value: string;
}

export interface GitMetadata {
  commitAuthorName?: string | undefined;
  commitMessage?: string | undefined;
  remoteUrl: string;
}

export interface DeploymentOptions {
  nodeVersion: string;
  installCommand?: string;
  buildCommand?: string;
  envList?: Env[];
  gitMetadata?: GitMetadata;
}

export interface InstanceParams {
  ImageId: string | undefined;
  InstanceType: string | undefined;
  KeyName: string | undefined;
  MinCount: number;
  MaxCount: number;
  UserData: string;
  IamInstanceProfile: {
    Arn: string | undefined;
  };
}

export interface RepoBuildOptions extends ClientOptions, DeploymentOptions {}

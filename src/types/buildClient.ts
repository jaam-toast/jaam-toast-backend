import { CreateProjectDefaultOptions } from "./collection";

type BuildClientParams = {
  projectId: string;
  deploymentId: string;
};

export type CreateBuildOptions = BuildClientParams &
  CreateProjectDefaultOptions;

export type UpdateBuildOptions = BuildClientParams &
  CreateBuildOptions & {
    instanceId?: string;
    recordId?: string;
    deployedUrl?: string;
    publicIpAddress?: string;
  };

export type DeleteBuildOptions = {
  projectId?: string;
  projectName: string;
  instanceId: string;
  publicIpAddress?: string;
};

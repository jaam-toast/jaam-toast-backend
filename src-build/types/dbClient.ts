export type DBClientParams = {
  projectName?: string;
  projectId?: string;
  deploymentId?: string;
};

export type UpdateDeploymentOptions = DBClientParams & {
  buildingLog?: (string | undefined)[];
  deployStatus?: string;
};

export type UpdateProjectOptions = DBClientParams & {
  instanceId?: string;
  deployedUrl?: string;
  recordId?: string;
  publicIpAddress?: string;
};

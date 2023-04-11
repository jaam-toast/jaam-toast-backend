import DB from "@src/__temp/services/DBService";
import ProjectService from "@src/__temp/services/ProjectService";

const updateProject = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const {
    projectUpdatedAt,
    projectName,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    buildType,
    webhookId,
    lastCommitMessage,
    lastCommitHash,
    instanceId,
    deployedUrl,
    deployments,
    publicIpAddress,
  } = service;

  const updateData = {
    ...(webhookId && { webhookId }),
    ...(projectUpdatedAt && { projectUpdatedAt }),
    ...(nodeVersion && { nodeVersion }),
    ...(installCommand && { installCommand }),
    ...(buildCommand && { buildCommand }),
    ...(buildType && { buildType }),
    ...(envList && { envList }),
    ...(instanceId && { instanceId }),
    ...(deployedUrl && { deployedUrl }),
    ...(lastCommitMessage && { lastCommitMessage }),
    ...(lastCommitHash && { lastCommitHash }),
    ...(webhookId && { webhookId }),
    ...(publicIpAddress && { publicIpAddress }),
    ...(deployments && { deployments }),
  };

  if (!Object.keys(updateData).length) {
    service.throw("Cannot find environment data before saving project.");
  }

  try {
    const project = await DB.Project.findOne({ projectName });

    if (!project || !project.deployments) {
      service.throw("Cannot find environment data");
    }

    if (project?.deployments.length > 1) {
      const deployment = await DB.Deployment.create();
      service.deployments = [deployment._id];
    }

    await DB.Project.findOneAndUpdate({ projectName }, updateData);

    service.projectId = project._id;
  } catch (error) {
    service.throw("An unexpected error occurred during saving project.", error);
  }

  next();
};

export default updateProject;

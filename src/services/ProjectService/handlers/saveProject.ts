import DB from "@src/services/DBService";
import ProjectService from "@src/services/ProjectService";

const saveProject = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const {
    userId,
    space,
    repoName,
    repoCloneUrl,
    projectUpdatedAt,
    projectName,
    nodeVersion,
    installCommand,
    buildCommand,
    buildType,
    envList,
    lastCommitMessage,
    lastCommitHash,
    webhookId,
  } = service;

  if (
    !userId ||
    !space ||
    !repoName ||
    !repoCloneUrl ||
    !projectUpdatedAt ||
    !projectName ||
    !nodeVersion ||
    !installCommand ||
    !buildCommand ||
    !buildType ||
    !envList ||
    !lastCommitMessage ||
    !lastCommitHash ||
    !webhookId
  ) {
    service.throw("Cannot find environment data before saving project.");
  }

  try {
    const newProject = await DB.Project.create({
      space,
      repoName,
      repoCloneUrl,
      projectUpdatedAt,
      projectName,
      nodeVersion,
      installCommand,
      buildCommand,
      buildType,
      envList,
      lastCommitMessage,
      lastCommitHash,
      webhookId,
    });

    if (!newProject) {
      service.throw("Failed to create database.");
    }

    await DB.User.findByIdAndUpdateProject(userId, newProject._id);

    service.projectId = newProject._id;
  } catch (error) {
    service.throw("An unexpected error occurred during saving project.", error);
  }

  next();
};

export default saveProject;

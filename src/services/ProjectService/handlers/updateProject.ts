import RepoModel from "@src/models/Repo";

import ProjectService from "@src/services/ProjectService";

async function updateProject(
  service: ProjectService,
  next: Function,
): Promise<void> {
  const { repoCloneUrl, lastCommitMessage } = service;

  try {
    const userRepo = await RepoModel.findOne({
      repoCloneUrl,
    }).lean();

    service.instanceId = userRepo?.instanceId;

    await RepoModel.updateOne(
      { repoCloneUrl },
      { $set: { lastCommitMessage } },
    );
  } catch (error) {
    service.throw(
      "An unexpected error occurred during updating project.",
      error,
    );
  }

  next();
}

export default updateProject;

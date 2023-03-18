import ProjectService from "..";
import Config from "../../../config";
import { Repo } from "../../../models/Repo";
import { createDeploymentDebug } from "../../../utils/createDebug";
import { DeploymentError } from "../../../config/errors";

async function updateProject(service: ProjectService, next: Function) {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const { repoCloneUrl, lastCommitMessage } = service;

  try {
    const userRepo = await Repo.findOne({
      repoCloneUrl,
    }).lean();

    service.instanceId = userRepo?.instanceId;

    await Repo.updateOne({ repoCloneUrl }, { $set: { lastCommitMessage } });
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during updating project. - ${error}.`,
    );

    throw new DeploymentError({
      code: "Projectservice_updateProject",
      message: "updateProject didn't work as expected",
    });
  }

  next();
}

export default updateProject;

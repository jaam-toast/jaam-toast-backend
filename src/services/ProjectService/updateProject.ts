import ProjectService from ".";
import Config from "../../config";
import { Repo } from "../../models/Repo";
import { createDeploymentDebug } from "../../utils/createDebug";

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
    // TODO
  }

  next();
}

export default updateProject;

import { startSession } from "mongoose";

import Config from "../../../config";
import { User } from "../../../models/User";
import { Repo } from "../../../models/Repo";
import { DeploymentError } from "../../../config/errors";
import { createDeploymentDebug } from "../../../utils/createDebug";

import ProjectService from "..";

const saveProject = async (service: ProjectService, next: Function) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const {
    repoName,
    repoCloneUrl,
    repoOwner,
    deployedUrl,
    instanceId,
    userId,
    repoUpdatedAt,
    nodeVersion,
    buildingLog,
    lastCommitMessage,
    webhookId,
    installCommand,
    buildCommand,
    buildType,
    envList,
  } = service;

  if (
    !repoOwner ||
    !deployedUrl ||
    !instanceId ||
    !webhookId ||
    !lastCommitMessage ||
    !buildingLog
  ) {
    debug("Error: Cannot find environment data before saving project.");

    throw new DeploymentError({
      code: "Projectservice_saveProject",
      message: "saveProject didn't work as expected",
    });
  }

  try {
    const session = await startSession();

    await session.withTransaction(async () => {
      const newRepoArr = await Repo.create(
        [
          {
            repoName,
            repoOwner,
            repoCloneUrl,
            repoUpdatedAt,
            nodeVersion,
            installCommand,
            buildCommand,
            buildType,
            envList,
            instanceId,
            buildingLog,
            deployedUrl,
            lastCommitMessage,
            webhookId,
          },
        ],
        { session },
      );

      const newRepo = newRepoArr[0].toObject();
      const repoId = newRepo._id;

      await User.updateOne(
        { _id: userId },
        { $push: { myRepos: newRepo._id } },
        { session, new: true },
      );

      service.repoId = repoId;
    });

    session.endSession();
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during saving project. - ${error}.`,
    );

    throw new DeploymentError({
      code: "Projectservice_saveProject",
      message: "saveProject didn't work as expected",
    });
  }

  debug("A new deployment's data is saved successfully!");

  next();
};

export default saveProject;

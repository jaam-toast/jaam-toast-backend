import { startSession } from "mongoose";

import UserModel from "@src/models/User";
import RepoModel from "@src/models/Repo";
import log from "@src/services/Logger";

import ProjectService from "@src/services/ProjectService";

const saveProject = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
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
    service.throw("Cannot find environment data before saving project.");
  }

  try {
    const session = await startSession();

    await session.withTransaction(async () => {
      const newRepoArr = await RepoModel.create(
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

      await UserModel.updateOne(
        { _id: userId },
        { $push: { myRepos: newRepo._id } },
        { session, new: true },
      );

      service.repoId = repoId;
    });

    session.endSession();
  } catch (error) {
    service.throw("An unexpected error occurred during saving project.", error);
  }

  log.build("A new deployment's data is saved successfully!");

  next();
};

export default saveProject;

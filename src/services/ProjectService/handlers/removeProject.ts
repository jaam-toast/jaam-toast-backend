import { startSession } from "mongoose";

import UserModel from "@src/models/User";
import RepoModel from "@src/models/Repo";
import log from "@src/services/Logger";

import ProjectService from "@src/services/ProjectService";

const removeProject = async (service: ProjectService, next: Function) => {
  const { instanceId, userId, repoId } = service;

  if (!instanceId || !userId || !repoId) {
    service.throw("Cannot find environment data before removing project data.");
  }

  try {
    const session = await startSession();

    await session.withTransaction(async () => {
      await UserModel.updateOne(
        { _id: userId },
        { $pull: { myRepos: repoId } },
      );
      await RepoModel.findByIdAndDelete(repoId);
    });

    session.endSession();

    log.build(
      `Successfully deleted the deployment data from database - ${instanceId}`,
    );
    log.build(`Successfully deleted a user-data.log of ${instanceId}`);
  } catch (error) {
    service.throw("An unexpected error occurred during removing project data.");
  }

  next();
};

export default removeProject;

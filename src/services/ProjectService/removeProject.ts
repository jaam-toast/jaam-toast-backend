import { startSession } from "mongoose";

import Config from "../../config";
import { User } from "../../models/User";
import { Repo } from "../../models/Repo";
import ProjectService from ".";
import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

const removeProject = async (service: ProjectService, next: Function) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const { instanceId, userId, repoId } = service;

  if (!instanceId || !userId || !repoId) {
    throw new Error(
      "Error: Cannot find environment data before removing project data.",
    );
  }

  try {
    const session = await startSession();

    await session.withTransaction(async () => {
      await User.updateOne({ _id: userId }, { $pull: { myRepos: repoId } });
      await Repo.findByIdAndDelete(repoId);

      // await deleteLogStream(instanceId);
    });

    session.endSession();

    debug(
      `Successfully deleted the deployment data from database - ${instanceId}`,
    );
    debug(`Successfully deleted a user-data.log of ${instanceId}`);
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during removing project data - ${error}.`,
    );

    throw new DeploymentError({
      code: "Projectservice_removeProject",
      message: "removeProject didn't work as expected",
    });
  }

  next();
};

export default removeProject;

import { startSession, Types } from "mongoose";

import Config from "../../../config";

import { User } from "../../../models/User";
import { Repo } from "../../../models/Repo";

import catchAsync from "../../../utils/asyncHandler";
import { DeploymentError } from "../../../utils/errors";
import { createDeploymentDebug } from "../../../utils/createDebug";

const deploySaveData = catchAsync(async (req, res, next) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const { repoName, repoCloneUrl, repoOwner, deployedUrl, instanceId } =
    req.deploymentData;
  const { user_id } = req.params;

  if (
    !repoName ||
    !repoCloneUrl ||
    !repoOwner ||
    !deployedUrl ||
    !instanceId ||
    !user_id
  ) {
    debug(
      "Error: 'repoName', 'repoCloneUrl', 'repoOwner', 'deployedUrl', and 'user_id' are expected to be strings",
    );

    return next(
      new DeploymentError({
        code: "deploySaveData",
        message:
          "'repoName', 'repoCloneUrl', 'repoOwner', 'deployedUrl', and 'user_id' are typeof undefined",
      }),
    );
  }

  const session = await startSession();
  let repoId: Types.ObjectId;

  await session.withTransaction(async () => {
    const newRepoArr = await Repo.create(
      [
        {
          ...req.deploymentData,
        },
      ],
      { session },
    );

    const newRepo = newRepoArr[0].toObject();
    repoId = newRepo._id;

    await User.updateOne(
      { _id: user_id },
      { $push: { myRepos: newRepo._id } },
      { session, new: true },
    );

    req.deploymentData.repoId = repoId;
  });

  session.endSession();

  debug("A new deployment's data is saved successfully!");

  next();
});

export default deploySaveData;

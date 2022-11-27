import { LeanDocument } from "mongoose";

import Config from "../../../config";

import { DBUser, User } from "../../../models/User";

import catchAsync from "../../../utils/asyncHandler";
import { DeploymentError } from "../../../utils/errors";
import { createDeploymentDebug } from "../../../utils/createDebug";

import { DBRepo } from "../../../models/Repo";

const getUserDeployList = catchAsync(async (req, res, next) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const { user_id } = req.params;

  if (!user_id) {
    debug("Error: 'user_id' is expected to be strings");

    return next(
      new DeploymentError({
        code: "getUserDeployList",
        message: "'user_id' is typeof undefined",
      }),
    );
  }

  let userDeployList: LeanDocument<DBRepo>[] | undefined = [];

  const userData = await User.findOne<DBUser>({ _id: user_id })
    .populate<{ myRepos: DBRepo[] }>("myRepos")
    .lean();

  userDeployList = userData?.myRepos || [];

  const filteredUserDeployList = userDeployList?.map(deployData => {
    const {
      repoName,
      repoOwner,
      repoCloneUrl,
      repoUpdatedAt,
      nodeVersion,
      installCommand,
      buildCommand,
      envList,
      buildType,
      deployedUrl,
      buildingLog,
      instanceId,
      lastCommitMessage,
      _id,
    } = deployData;

    const filteredDeployData = {
      repoName,
      repoOwner,
      repoCloneUrl,
      repoUpdatedAt,
      nodeVersion,
      installCommand,
      buildCommand,
      envList,
      buildType,
      deployedUrl,
      buildingLog,
      instanceId,
      lastCommitMessage,
      repoId: _id,
    };

    return filteredDeployData;
  });

  return res.json({
    result: "ok",
    data: filteredUserDeployList,
  });
});

export default getUserDeployList;

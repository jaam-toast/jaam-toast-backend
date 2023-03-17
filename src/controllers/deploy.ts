import { LeanDocument, startSession } from "mongoose";
import createError from "http-errors";

import Config from "../config";
import { DBUser, User } from "../models/User";
import { DBRepo, Repo } from "../models/Repo";
import ProjectService from "../services/ProjectService";
import GithubClient from "../services/GithubClient";
import catchAsync from "../utils/asyncHandler";
import { CustomError } from "../utils/errors";
import { createGeneralLogDebug } from "../utils/createDebug";

interface PullRequestData {
  prAction: boolean;
  merged: string;
  title: string;
  updatedAt: string;
  headRef: string;
  headSha: string;
  prUser: string;
  repoOwner: string;
  repoName: string;
  cloneUrl: string;
}

export const deployProject = catchAsync(async (req, res, next) => {
  const buildOption = req.body;
  const { githubAccessToken } = req.query;
  const { user_id } = req.params;

  const project = new ProjectService();

  await project.deployProject({
    ...buildOption,
    userId: user_id,
    githubAccessToken,
  });

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
    repoId,
    webhookId,
  } = project;

  res.status(201).json({
    result: "ok",
    data: {
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
      repoId,
      webhookId,
    },
  });

  return;
});

export const getUserDeployList = catchAsync(async (req, res, next) => {
  const debug = createGeneralLogDebug(Config.CLIENT_OPTIONS.debug);

  const { user_id } = req.params;

  if (!user_id) {
    debug("Error: 'user_id' is expected to be a string");

    return next(
      new CustomError({
        code: "400: getUserDeployList",
        message: "Error: Cannot find environment data 'user_id'",
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

export const updateDeployment = catchAsync(async (req, res, next) => {
  const { action, pull_request, repository } = req.body;

  if (action !== "closed" || !pull_request.merged) {
    return next(
      createError(
        401,
        "Received abnormal PR data or PR that has not yet been merged.",
      ),
    );
  }

  const {
    merged,
    title,
    updated_at,
    head: { ref, sha },
    user: { login: prUser },
  } = pull_request;
  const {
    owner: { login: repoOwner },
    name,
    clone_url,
  } = repository;

  const pullRequestData: PullRequestData = {
    prAction: action,
    merged,
    title,
    updatedAt: updated_at,
    headRef: ref,
    headSha: sha,
    prUser,
    repoOwner,
    repoName: name,
    cloneUrl: clone_url,
  };

  const githubAccessToken = Config.USER_CREDENTIAL_TOKEN;
  const githubClient = new GithubClient(githubAccessToken as string);
  const { commit } = await githubClient.getHeadCommitMessage(
    pullRequestData.repoOwner,
    pullRequestData.repoName,
    pullRequestData.headRef,
  );
  const lastCommitMessage = commit.message;

  const project = new ProjectService();
  await project.redeployProject({
    repoCloneUrl: pullRequestData.cloneUrl,
    lastCommitMessage,
    repoName: pullRequestData.repoName,
  });

  return res.json({
    result: "ok",
  });
});

export const deleteDeployment = catchAsync(async (req, res, next) => {
  const debug = createGeneralLogDebug(Config.CLIENT_OPTIONS.debug);
  const { githubAccessToken } = req.query;
  const { user_id, repo_id } = req.params;
  const { instanceId, repoName } = req.body;

  if (!githubAccessToken || !user_id || !repo_id || !instanceId || !repoName) {
    debug(
      "Error: 'githubAccessToken', 'user_id', 'repo_id', 'instanceId', and 'repoName' are expected to be strings",
    );

    return next(
      new CustomError({
        code: "400: deleteDeployment",
        message:
          "Error: Cannot find environment data 'githubAccessToken', 'user_id', 'repo_id', 'instanceId', and 'repoName'",
      }),
    );
  }

  const session = await startSession();

  await session.withTransaction(async () => {
    await User.updateOne({ _id: user_id }, { $pull: { myRepos: repo_id } });

    const repo = await Repo.findByIdAndDelete(repo_id);

    if (!repo) {
      throw new Error();
    }

    const project = new ProjectService();

    await project.deleteProject({
      userId: user_id,
      repoId: repo._id,
      instanceId,
      subdomain: repoName,
      publicIpAddress: repo.publicIpAddress,
    });
  });

  session.endSession();

  debug(`Successfully deleted an instance - ${instanceId}`);

  return res.json({
    result: "ok",
  });
});

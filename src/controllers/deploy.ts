import { startSession } from "mongoose";
import createError from "http-errors";

import Config from "@src/config";
import catchAsync from "@src/controllers/utils/asyncHandler";
import UserModel from "@src/models/User";
import RepoModel from "@src/models/Repo";
import ProjectService from "@src/services/ProjectService";
import GithubClient from "@src/services/GithubClient";

import { LeanDocument } from "mongoose";
import { Repo } from "@src/types";

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
  const { user_id } = req.params;

  if (!user_id) {
    return next(createError(401, "Cannot find environment data 'user_id'"));
  }

  let userDeployList: LeanDocument<Repo>[] | undefined = [];

  const userData = await UserModel.findOne({ _id: user_id })
    .populate<{ myRepos: Repo[] }>("myRepos")
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
  const { githubAccessToken } = req.query;
  const { user_id, repo_id } = req.params;
  const { instanceId, repoName } = req.body;

  if (!githubAccessToken || !user_id || !repo_id || !instanceId || !repoName) {
    return next(
      createError(
        400,
        "Cannot find environment data 'githubAccessToken', 'user_id', 'repo_id', 'instanceId', and 'repoName'",
      ),
    );
  }

  const session = await startSession();

  await session.withTransaction(async () => {
    await UserModel.updateOne(
      { _id: user_id },
      { $pull: { myRepos: repo_id } },
    );

    const repo = await RepoModel.findByIdAndDelete(repo_id);

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

  return res.json({
    result: "ok",
  });
});

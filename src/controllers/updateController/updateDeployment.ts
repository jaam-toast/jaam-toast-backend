import mongoose from "mongoose";

import Config from "../../config";

import { getHeadCommitMessage } from "../../services/GithubService/client";
import runUpdateDeploymentCommands from "../../services/deploy/cli/runUpdateDeploymentCommands";

import catchAsync from "../../utils/asyncHandler";
import { createDeploymentDebug } from "../../utils/createDebug";
import { Repo } from "../../models/Repo";

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

const updateDeployment = catchAsync(async (req, res, next) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const githubAccessToken = Config.USER_CREDENTIAL_TOKEN;

  const githubPullRequestPayload = req.body;

  if (
    githubPullRequestPayload.action === "closed" &&
    githubPullRequestPayload.pull_request.merged
  ) {
    const { action, pull_request, repository } = githubPullRequestPayload;

    debug(
      `Successfully received githubPullRequestPayload of the new pull request through Github webhook - A pull request is ${action}`,
      `The status of merged pull request is - ${pull_request.merged}`,
    );

    const pullRequestData: PullRequestData = {
      prAction: action,
      merged: pull_request.merged,
      title: pull_request.title,
      updatedAt: pull_request.updated_at,
      headRef: pull_request.head.ref,
      headSha: pull_request.head.sha,
      prUser: pull_request.user.login,
      repoOwner: repository.owner.login,
      repoName: repository.name,
      cloneUrl: repository.clone_url,
    };

    const { commit } = await getHeadCommitMessage(
      githubAccessToken as string,
      pullRequestData.repoOwner,
      pullRequestData.repoName,
      pullRequestData.headRef,
    );

    const lastCommitMessage = commit.message;

    const session = await mongoose.startSession();
    let userRepo;
    let instanceId;

    await session.withTransaction(async () => {
      userRepo = await Repo.findOne(
        {
          repoCloneUrl: pullRequestData.cloneUrl,
        },
        null,
        { session },
      ).lean();

      await Repo.updateOne(
        { repoCloneUrl: pullRequestData.cloneUrl },
        { $set: { lastCommitMessage } },
        { session },
      );

      instanceId = userRepo?.instanceId;
    });

    session.endSession();

    runUpdateDeploymentCommands(`${instanceId}`, pullRequestData.repoName);

    debug(
      `Successfully requested for deploymnet updates of the new pull request from Github webhook`,
    );
  }

  return res.json({
    result: "ok",
  });
});

export default updateDeployment;

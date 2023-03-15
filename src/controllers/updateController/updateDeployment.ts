import createError from "http-errors";

import Config from "../../config";
import GithubClient from "../../services/GithubClient";
import ProjectService from "../../services/ProjectService";
import catchAsync from "../../utils/asyncHandler";

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

export default updateDeployment;

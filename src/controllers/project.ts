import createError from "http-errors";

import Config from "@src/config";
import catchAsync from "@src/controllers/utils/asyncHandler";
import UserModel from "@src/services/DBService/user";
import ProjectModel from "@src/services/DBService/project";
import DeploymentModel from "@src/services/DBService/deployment";
import GithubClient from "@src/services/GithubClient";
import ProjectService from "@src/services/ProjectService";

export const createProject = catchAsync(async (req, res, next) => {
  const buildOption = req.body;

  const { githubAccessToken } = req.query;
  const { userId, space, repoName } = buildOption;

  if (!userId || !space || !repoName) {
    return next(createError(401, "The required data is missing."));
  }

  const newProject = await ProjectModel.create({
    ...buildOption,
    space,
    repoName,
  });

  await UserModel.findByIdAndUpdateProject(userId, newProject._id);

  if (!newProject) {
    return next(createError(500, "Failed to create database."));
  }

  res.json({
    result: "ok",
    projectId: newProject._id,
  });

  const project = new ProjectService();

  await project.deployProject({
    ...buildOption,
    userId,
    githubAccessToken,
  });

  const {
    // subdomain,
    // repoName,
    // repoOwner,
    // repoCloneUrl,
    // nodeVersion,
    // installCommand,
    // buildCommand,
    // envList,
    // buildType,
    // repoId,
    repoUpdatedAt,
    deployedUrl,
    buildingLog,
    instanceId,
    lastCommitMessage,
    webhookId,
  } = project;

  await ProjectModel.findByIdAndUpdate(newProject._id, {
    instanceId,
    deployedUrl,
    lastCommitMessage,
    // add lastCommitHash,
    // add publicIpAddress,
    webhookId,
  });

  await DeploymentModel.findByIdAndUpdate(newProject._id, {
    buildingLog,
    repoUpdatedAt,
    deployedStatus: "test...",
    lastCommitMessage: "test...",
    lastCommitHash: "test...",
  });

  return;
});

export const getProject = catchAsync(async (req, res, next) => {
  const { project_name: projectName } = req.params;

  if (!projectName) {
    return next(
      createError(401, "Cannot find environment data 'project_name'"),
    );
  }

  const project = await ProjectModel.findOne({ projectName });

  return res.json({
    result: "ok",
    data: project,
  });
});

export const updateProject = catchAsync(async (req, res, next) => {
  const { preject_name: projectName } = req.params;
  const { type } = req.query;

  switch (type) {
    case "pull_request_update": {
      const { action, pull_request, repository } = req.body;

      if (action !== "closed" || !pull_request.merged) {
        return next(
          createError(
            401,
            "Received abnormal PR data or PR that has not yet been merged.",
          ),
        );
      }

      const githubAccessToken = Config.USER_CREDENTIAL_TOKEN;
      const githubClient = new GithubClient(githubAccessToken as string);
      const project = new ProjectService();

      const repoOwner = repository.owner.login;
      const repoName = repository.name;
      const headRef = pull_request.head.ref;

      const { commit } = await githubClient.getHeadCommitMessage(
        repoOwner,
        repoName,
        headRef,
      );

      const redeployOptions = {
        repoCloneUrl: repository.clone_url,
        lastCommitMessage: commit.message,
        repoName,
      };
      await project.redeployProject(redeployOptions);

      // TODO db update logic
      return res.json({
        result: "ok",
        data: project,
      });
    }
    case "option_update": {
      const { nodeVersion, installCommand, buildCommand, buildType, envList } =
        req.body;

      const updateData = {
        ...(nodeVersion && { nodeVersion }),
        ...(installCommand && { installCommand }),
        ...(buildCommand && { buildCommand }),
        ...(buildType && { buildType }),
        ...(envList && { envList }),
      };

      if (
        !nodeVersion &&
        !installCommand &&
        !buildCommand &&
        !buildType &&
        !envList
      ) {
        return next(
          createError(401, "Insufficient data to process the request"),
        );
      }

      const project = await ProjectModel.findOneAndUpdate(
        { projectName },
        updateData,
      );

      return res.json({
        result: "ok",
        data: project,
      });
    }
    default: {
      return next(createError(401, "No query type data"));
    }
  }
});

export const deleteProject = catchAsync(async (req, res, next) => {
  const { githubAccessToken } = req.query;
  const { project_name: projectName } = req.params;
  if (!githubAccessToken || !projectName) {
    return next(
      createError(
        400,
        "Cannot find environment data 'githubAccessToken', and 'projectName'",
      ),
    );
  }

  // TODO
  const deletedProject = await ProjectModel.findOneAndDelete({ projectName });

  if (!deletedProject) {
    return next(createError(500, "Failed to delete database."));
  }

  const project = new ProjectService();

  await project.deleteProject({
    repoId: deletedProject?._id,
    instanceId: deletedProject?.instanceId,
    projectName: deletedProject?.projectName,
    publicIpAddress: deletedProject?.publicIpAddress,
  });

  return res.json({
    result: "ok",
  });
});

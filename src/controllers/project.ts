import createError from "http-errors";

import Config from "@src/config";
import catchAsync from "@src/controllers/utils/asyncHandler";
import DB from "@src/services/DBService";
import GithubClient from "@src/services/GithubClient";
import ProjectService from "@src/services/ProjectService";

export const createProject = catchAsync(async (req, res, next) => {
  const buildOption = req.body;
  const { githubAccessToken } = req.query;
  const { userId, space, repoName } = buildOption;

  if (!userId || !space || !repoName) {
    return next(createError(401, "The required data is missing."));
  }

  const newProject = await DB.Project.create({
    ...buildOption,
    space,
    repoName,
  });

  if (!newProject) {
    return next(createError(500, "Failed to create database."));
  }

  await DB.User.findByIdAndUpdateProject(userId, newProject._id);

  res.json({
    message: "ok",
    result: newProject._id,
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

  await DB.Project.findByIdAndUpdate(newProject._id, {
    instanceId,
    deployedUrl,
    lastCommitMessage,
    // add lastCommitHash,
    // add publicIpAddress,
    webhookId,
  });

  await DB.Deployment.findByIdAndUpdate(newProject._id, {
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

  const project = await DB.Project.findOne({ projectName });

  return res.json({
    message: "ok",
    result: project,
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
        message: "ok",
        result: project,
      });
    }
    case "option_update": {
      const {
        nodeVersion,
        installCommand,
        buildCommand,
        buildType,
        envList,
        instanceId,
        deployedUrl,
        lastCommitMessage,
        lastCommitHash,
        webhookId,
        publicIpAddress,
      } = req.body;

      const updateData = {
        ...(nodeVersion && { nodeVersion }),
        ...(installCommand && { installCommand }),
        ...(buildCommand && { buildCommand }),
        ...(buildType && { buildType }),
        ...(envList && { envList }),
        ...(instanceId && { instanceId }),
        ...(deployedUrl && { deployedUrl }),
        ...(lastCommitMessage && { lastCommitMessage }),
        ...(lastCommitHash && { lastCommitHash }),
        ...(webhookId && { webhookId }),
        ...(publicIpAddress && { publicIpAddress }),
      };

      if (!Object.keys(updateData).length) {
        return next(
          createError(401, "Insufficient data to process the request"),
        );
      }

      const project = await DB.Project.findOneAndUpdate(
        { projectName },
        updateData,
      );

      return res.json({
        message: "ok",
        result: project,
      });
    }
    default: {
      return next(createError(401, "No query type data"));
    }
  }
});

export const updateDeployment = catchAsync(async (req, res, next) => {
  const { deployment_id } = req.params;
  const {
    buildingLog,
    deployedStatus,
    lastCommitMessage,
    lastCommitHash,
    repoUpdatedAt,
  } = req.body;

  const updateData = {
    ...(buildingLog && { buildingLog }),
    ...(deployedStatus && { deployedStatus }),
    ...(lastCommitMessage && { lastCommitMessage }),
    ...(lastCommitHash && { lastCommitHash }),
    ...(repoUpdatedAt && { repoUpdatedAt }),
  };

  const updateDeployment = await DB.Deployment.findByIdAndUpdate(
    deployment_id,
    updateData,
  );

  return res.json({
    message: "ok",
    result: updateDeployment,
  });
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
  const deletedProject = await DB.Project.findOneAndDelete({ projectName });

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
    message: "ok",
  });
});

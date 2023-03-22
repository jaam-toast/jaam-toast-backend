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
  const { userId, space, repository } = buildOption;

  const newProject = await ProjectModel.create({
    ...buildOption,
    space,
    repoName: repository,
  });

  await UserModel.findByIdAndUpdateProject(userId, newProject._id);

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

export const getUserProjects = catchAsync(async (req, res, next) => {
  const { user_id } = req.params;

  if (!user_id) {
    return next(createError(401, "Cannot find environment data 'user_id'"));
  }

  const userProjects = await UserModel.findByIdAndGetProjects(user_id);

  const filteredUserProjects = userProjects?.map(project => {
    const {
      _id,
      space,
      repoName,
      repoCloneUrl,
      repoUpdatedAt,
      projectName,
      nodeVersion,
      installCommand,
      buildCommand,
      buildType,
      envList,
      instanceId,
      deployedUrl,
      lastCommitMessage,
      lastCommitHash,
      deployments,
    } = project;

    const filteredProjectData = {
      repoName,
      space,
      repoCloneUrl,
      repoUpdatedAt,
      projectName,
      nodeVersion,
      installCommand,
      buildCommand,
      envList,
      buildType,
      deployedUrl,
      instanceId,
      projectId: _id,
      lastCommitMessage,
      lastCommitHash,
      deployments,
    };

    return filteredProjectData;
  });

  return res.json({
    result: "ok",
    data: filteredUserProjects,
  });
});

export const updateProject = catchAsync(async (req, res, next) => {
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

  return res.json({
    result: "ok",
  });
});

export const deleteProject = catchAsync(async (req, res, next) => {
  const { githubAccessToken } = req.query;
  const { projectId } = req.params;

  if (!githubAccessToken || !projectId) {
    return next(
      createError(
        400,
        "Cannot find environment data 'githubAccessToken', and 'projectName'",
      ),
    );
  }

  const deletedProject = await ProjectModel.findByIdAndDelete(projectId);

  if (!deletedProject) {
    return next(createError(500));
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

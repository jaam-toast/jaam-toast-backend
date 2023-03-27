import createError from "http-errors";

import catchAsync from "@src/controllers/utils/asyncHandler";
import DB from "@src/services/DBService";
import ProjectService from "@src/services/ProjectService";

export const createProject = catchAsync(async (req, res, next) => {
  const buildOption = req.body;
  const githubAccessToken = req.query.githubAccessToken as string;

  if (!buildOption || !githubAccessToken) {
    return next(createError(401, "Cannot find environment data."));
  }

  const project = new ProjectService();
  await project.createProject({
    ...buildOption,
    githubAccessToken,
  });

  const { projectId } = project;

  if (!projectId) {
    return next(createError(500, "Failed to create database."));
  }

  return res.status(201).json({
    message: "ok",
    result: projectId,
  });
});

export const getProject = catchAsync(async (req, res, next) => {
  const { project_name: projectName } = req.params;

  if (!projectName) {
    return next(
      createError(401, "Cannot find environment data 'project_name'"),
    );
  }

  const project = await DB.Project.findOne({ projectName });

  if (!project) {
    return next(createError(400, "Project data does not exist."));
  }

  return res.json({
    message: "ok",
    result: project,
  });
});

export const updateProjectByWebhook = catchAsync(async (req, res, next) => {
  const { project_name: projectName } = req.params;
  const eventType = req.header("X-GitHub-Event");

  if (eventType === "ping") {
    return res.json({
      message: "The webhook has been successfully installed.",
    });
  }

  const updatedBranch = req.body.ref.slice(11);
  const { head_commit: headCommit, repository } = req.body;

  if (!headCommit) {
    return next(createError(400, "Cannot find environment data"));
  }

  if (updatedBranch !== "main" && updatedBranch !== "master") {
    return res.status(304).json({
      message: "ok",
    });
  }

  const project = new ProjectService();
  await project.updateProject({
    projectName,
    webhookId: repository.id,
    projectUpdatedAt: headCommit.timestamp,
    lastCommitMessage: headCommit.message,
    lastCommitHash: headCommit.id,
  });
  const { projectId } = project;

  if (!projectId) {
    return next(createError(500, "Failed to update database."));
  }

  return res.json({
    message: "ok",
    result: projectId,
  });
});

export const updateProject = catchAsync(async (req, res, next) => {
  const { project_name: projectName } = req.params;
  const updateOptions = req.body;

  const project = new ProjectService();
  await project.updateProject({
    projectName,
    ...updateOptions,
  });

  const { projectId } = project;

  if (!projectId) {
    return next(createError(500, "Failed to update database."));
  }

  return res.json({
    message: "ok",
    result: projectId,
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

  const project = new ProjectService();
  await project.deleteProject(projectName);

  const { projectId: deletedProjectId } = project;

  if (!deletedProjectId) {
    return next(createError(500, "Failed to delete database."));
  }

  return res.status(204).json({
    message: "ok",
  });
});

import createError from "http-errors";

import catchAsync from "@src/controllers/utils/asyncHandler";
import DB from "@src/services/DBService";
import ProjectService from "@src/services/ProjectService";

import type { BuildOptions } from "@src/types";

export const createProject = catchAsync(async (req, res, next) => {
  const buildOption: BuildOptions = req.body;
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

  res.status(201).json({
    message: "ok",
    result: projectId,
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

  if (!project) {
    return next(createError(400, "Project data does not exist."));
  }

  return res.json({
    message: "ok",
    result: project,
  });
});

export const updateProject = catchAsync(async (req, res, next) => {
  const { preject_name: projectName } = req.params;
  const { event, payload } = res.locals;

  switch (event) {
    case "ping": {
      return res.json({
        message: "The webhook has been successfully installed.",
      });
    }
    case "push": {
      if (
        payload.ref.slice(11) !== "main" &&
        payload.ref.slice(11) !== "master"
      ) {
        return res.status(304).json({
          message: "ok",
        });
      }

      const { head_commit: headCommit, repository } = req.body;

      const webhookId = repository.id;
      const projectUpdatedAt = headCommit.timestamp;
      const lastCommitMessage = headCommit.message;
      const lastCommitHash = headCommit.id;

      const project = new ProjectService();

      await project.updateProject({
        webhookId,
        projectUpdatedAt,
        lastCommitMessage,
        lastCommitHash,
      });

      const { projectId, deploymentId } = project;

      if (!projectId || !deploymentId) {
        return next(createError(500, "Failed to update database."));
      }

      return res.json({
        message: "ok",
        result: projectId,
      });
    }
    default: {
      const updateOptions = req.body;

      const project = new ProjectService();

      await project.updateProject({
        projectName,
        ...updateOptions,
      });

      const { projectId, deploymentId } = project;

      if (!projectId || !deploymentId) {
        return next(createError(500, "Failed to update database."));
      }

      return res.json({
        message: "ok",
        result: projectId,
      });
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

import { Router } from "express";
import createError from "http-errors";
import Joi from "joi";

import ProjectService from "@src/services/ProjectService";
import DB from "@src/services/DBService";
import verifyToken from "@src/app/middlewares/verifyToken";
import validateSchema from "@src/app/middlewares/validateSchema";
import { asyncHandler } from "../utils/asyncHandler";

const route = Router();

const projectsRouter = (app: Router) => {
  app.use("/projects", route);

  route.post(
    "/",
    verifyToken,
    asyncHandler(async (req, res, next) => {
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
    }),
  );

  route.get(
    "/:project_name",
    validateSchema(
      Joi.object({
        project_name: Joi.string().regex(/^[a-zA-Z0-9]+$/i),
      }),
      "params[project_name]",
    ),
    verifyToken,
    asyncHandler(async (req, res, next) => {
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
    }),
  );

  route.put(
    "/:project_name",
    validateSchema(
      Joi.object({
        project_name: Joi.string().regex(/^[a-zA-Z0-9]+$/i),
      }),
      "params[project_name]",
    ),
    verifyToken,
    asyncHandler(async (req, res, next) => {
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
    }),
  );

  route.delete(
    "/:project_name",
    validateSchema(
      Joi.object({
        project_name: Joi.string().regex(/^[a-zA-Z0-9]+$/i),
      }),
      "params[project_name]",
    ),
    verifyToken,
    asyncHandler(async (req, res, next) => {
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
    }),
  );
};

export default projectsRouter;

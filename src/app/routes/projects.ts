import { Router } from "express";
import createError from "http-errors";
import Joi from "joi";

import { BuildService } from "../../domains/buildService";
import { CmsService } from "../../domains/cmsService";
import { ProjectRepository } from "../../domains/repositories/projectRepository";
import { UserRepository } from "../../domains/repositories/userRepository";
import verifyToken from "../middlewares/verifyToken";
import validateSchema from "../middlewares/validateSchema";
import { asyncHandler } from "../utils/asyncHandler";

const route = Router();

const projectsRouter = (app: Router) => {
  app.use("/projects", route);

  route.post(
    "/",
    verifyToken,
    asyncHandler(async (req, res, next) => {
      const projectOptions = req.body;

      const {
        userId,
        space,
        repoName,
        repoCloneUrl,
        projectName,
        projectUpdatedAt,
        framework,
        installCommand,
        buildCommand,
        envList,
      } = projectOptions;

      if (
        !userId ||
        !space ||
        !repoName ||
        !repoCloneUrl ||
        !projectName ||
        !projectUpdatedAt ||
        !framework ||
        !installCommand ||
        !buildCommand ||
        !envList
      ) {
        return next(
          createError(401, "Cannot find environment data 'project_name'"),
        );
      }

      const project = await ProjectRepository.create(projectOptions);
      const user = await UserRepository.findByIdAndUpdateProject(
        userId,
        project._id,
      );

      if (!project || !user) {
        return next(createError(500, "Failed to create database."));
      }

      res.json({
        message: "ok",
        result: project._id,
      });

      const buildUrl = await BuildService.createBuild({
        repoName,
        repoCloneUrl,
        projectName,
        framework,
        installCommand,
        buildCommand,
        envList,
      });
      const cmsUrl = await CmsService.createApi();
      await ProjectRepository.findByIdAndUpdate(project._id, {
        buildUrl,
        cmsUrl,
      });
    }),
  );

  // 진행중..
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
      const { projectId } = req.params;

      if (!projectId) {
        return next(
          createError(401, "Cannot find environment data 'project_name'"),
        );
      }

      const project = await ProjectRepository.findById(projectId);

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
      const { projectId } = req.params;
      const updateData = req.body;

      if (!projectId) {
        return next(createError(500, "Failed to update database."));
      }

      const buildService = new BuildService();
      const projectData = await buildService.updateBuild(updateData);

      return res.json({
        message: "ok",
        result: projectData,
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
      const { projectId } = req.params;

      if (!projectId) {
        return next(
          createError(
            400,
            "Cannot find environment data 'githubAccessToken', and 'projectName'",
          ),
        );
      }

      const buildService = new BuildService();
      const cmsService = new CmsService();
      await buildService.deleteBuild(projectId);
      await cmsService.deleteApi();

      return res.status(204).json({
        message: "ok",
      });
    }),
  );
};

export default projectsRouter;

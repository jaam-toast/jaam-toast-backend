import { Router } from "express";
import createError from "http-errors";
import Joi from "joi";
import * as _ from "lodash";

import verifyToken from "../middlewares/verifyToken";
import validateRequest from "../middlewares/validateRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { BUILD_MESSAGE } from "../../config/constants";
import { ProjectService } from "../../domains/projectService";
import { UserService } from "../../domains/userService";
import { Logger as log } from "../../util/Logger";
import { container } from "../../domains/@config/di.config";

const route = Router();

const projectsRouter = (app: Router) => {
  app.use("/projects", route);

  route.post(
    "/",
    verifyToken,
    validateRequest(
      Joi.object({
        userId: Joi.string(),
        space: Joi.string().required(),
        repoName: Joi.string().required(),
        repoCloneUrl: Joi.string().required(),
        projectName: Joi.string().required(),
        projectUpdatedAt: Joi.string().required(),
        framework: Joi.string().required(),
        installCommand: Joi.string().required(),
        buildCommand: Joi.string().required(),
        envList: Joi.array().required(),
      }),
      "body",
    ),
    asyncHandler(async (req, res) => {
      const projectOptions = req.body;
      const { username } = req.app.locals;
      const { projectName, userId } = projectOptions;

      res.json({
        message: "ok",
        result: projectName,
      });

      const projectService = container.get<ProjectService>("ProjectService");
      const userService = container.get<UserService>("UserService");

      try {
        await projectService.createProject(_.omit(projectOptions, ["userId"]));
        await userService.addProject({ userId, projectName });
      } catch (error) {
        console.log(error);
        log.serverError(BUILD_MESSAGE.ERROR.FAIL_PROJECT_CREATION);
      }
    }),
  );

  route.get(
    "/:project_name",
    verifyToken,
    validateRequest(
      Joi.object({
        project_name: Joi.string().required(),
      }),
      "params ",
    ),
    asyncHandler(async (req, res, next) => {
      const { project_name } = req.params;

      const projectService = container.get<ProjectService>("ProjectService");
      const project = await projectService.getByProjectName(project_name);

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
    verifyToken,
    validateRequest(
      Joi.object({
        project_name: Joi.string().required(),
      }),
      "params",
    ),
    asyncHandler(async (req, res) => {
      const { project_name } = req.params;
      const updateData = req.body;

      return res.json({
        message: "ok",
      });
    }),
  );

  route.delete(
    "/:project_name",
    verifyToken,
    validateRequest(
      Joi.object({
        project_name: Joi.string().required(),
      }),
      "params",
    ),
    asyncHandler(async (req, res) => {
      const { username } = req.app.locals;
      const { project_name: projectName } = req.params;

      const projectService = container.get<ProjectService>("ProjectService");
      const userService = container.get<UserService>("UserService");

      await projectService.deleteProject({ projectName });
      await userService.deleteProject({ username, projectName });

      return res.status(204).json({
        message: "ok",
      });
    }),
  );
};

export default projectsRouter;

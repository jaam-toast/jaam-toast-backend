import { Router } from "express";
import createError from "http-errors";
import Joi from "joi";
import * as _ from "lodash";
import Ajv from "ajv";

import { schemasRouter } from "./schemas";
import { verifyAccessToken } from "../../middlewares/verifyAccessToken";
import { validateRequest } from "../../middlewares/validateRequest";
import { BUILD_MESSAGE } from "../../../config/constants";
import { ProjectService } from "../../../domains/projectService";
import { UserService } from "../../../domains/userService";
import { container } from "../../../domains/@config/di.config";
import { asyncHandler } from "../../utils/asyncHandler";
import { Logger as log } from "../../../utils/Logger";

export const projectsRouter = Router();

projectsRouter.use(verifyAccessToken);

projectsRouter.post(
  "/",
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
      // TODO: add nodeVersion
    }),
    "body",
  ),
  asyncHandler(async (req, res) => {
    const projectOptions = req.body;
    const { username } = req.app.locals;
    const { projectName, userId } = projectOptions;

    res.status(201).json({
      message: "ok",
      result: projectName,
    });

    const projectService = container.get<ProjectService>("ProjectService");
    const userService = container.get<UserService>("UserService");

    try {
      await projectService.createProject(_.omit(projectOptions, ["userId"]));
      await userService.addProject({ userId, projectName });
    } catch (error) {
      log.serverError(BUILD_MESSAGE.CREATE_ERROR.FAIL_PROJECT_CREATION);
    }
  }),
);

projectsRouter.get(
  "/:project_name",
  validateRequest(
    Joi.object({
      project_name: Joi.string().required(),
    }),
    "params",
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

projectsRouter.put(
  "/:project_name",
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

projectsRouter.delete(
  "/:project_name",
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

const ajv = new Ajv();

projectsRouter.post(
  "/:project_name/schemas",
  validateRequest(
    Joi.object({
      project_name: Joi.string().required(),
    }),
    "params",
  ),
  validateRequest(
    Joi.object({
      title: Joi.string().required(),
    }),
    "body",
  ),
  asyncHandler(async (req, res, next) => {
    const schema = req.body;

    try {
      ajv.compile(schema);
    } catch (error) {
      return res.status(400).json({
        message: "The schema field is not of JSON Schema or failed validation.",
      });
    }

    const projectService = container.get<ProjectService>("ProjectService");
    const { project_name: projectName } = req.params;

    await projectService.addSchema({
      projectName,
      schema,
    });

    return res.status(201).json({
      message: "ok",
    });
  }),
);

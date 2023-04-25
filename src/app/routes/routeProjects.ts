import { Router } from "express";
import { z } from "zod";
import { omit } from "lodash";
import createError from "http-errors";

import { parseRequest } from "../middlewares/parseRequest";
import { verifyAccessToken } from "../middlewares/verifyAccessToken";
import { BUILD_MESSAGE } from "../../config/constants";
import { ProjectService } from "../../domains/projectService";
import { UserService } from "../../domains/userService";
import { container } from "../../domains/@config/di.config";
import { handleAsync } from "../utils/handleAsync";
import { Logger as log } from "../../utils/Logger";

export const projectsRouter = Router();

projectsRouter.use(verifyAccessToken);

projectsRouter.post(
  "/projects",
  parseRequest({
    body: z.object({
      userId: z.string(),
      space: z.string(),
      repoName: z.string(),
      repoCloneUrl: z.string(),
      projectName: z.string(),
      projectUpdatedAt: z.string(),
      framework: z.union([
        z.literal("CreateReactApp"),
        z.literal("ReactStatic"),
        z.literal("NextJs"),
        z.literal("NuxtJs"),
        z.literal("Angular"),
        z.literal("Astro"),
        z.literal("Gatsby"),
        z.literal("GitBook"),
        z.literal("Jekyll"),
        z.literal("Remix"),
        z.literal("Svelte"),
        z.literal("Vue"),
        z.literal("VuePress"),
      ]),
      installCommand: z.string(),
      buildCommand: z.string(),
      envList: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        }),
      ),
      nodeVersion: z.string(),
    }),
  }),
  handleAsync(async (req, res) => {
    const projectOptions = req.body;
    const { projectName, userId } = projectOptions;

    res.status(201).json({
      message: "ok",
      result: projectName,
    });

    const projectService = container.get<ProjectService>("ProjectService");
    const userService = container.get<UserService>("UserService");
    const createProjectOptions = omit(projectOptions, ["userId"]);

    try {
      await projectService.createProject(createProjectOptions);
      await userService.addProject({ userId, projectName });
    } catch (error) {
      log.serverError(BUILD_MESSAGE.CREATE_ERROR.FAIL_PROJECT_CREATION);
    }
  }),
);

projectsRouter.get(
  "/projects/:projectName",
  parseRequest({
    params: z.object({
      projectName: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const { projectName } = req.params;

    const projectService = container.get<ProjectService>("ProjectService");
    const project = await projectService.getByProjectName(projectName);

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
  "/projects/:projectName",
  parseRequest({
    params: z.object({
      projectName: z.string(),
    }),
  }),
  handleAsync(async (req, res) => {
    const { projectName } = req.params;
    const updateData = req.body;

    // TODO: update project.

    return res.json({
      message: "ok",
    });
  }),
);

projectsRouter.delete(
  "/projects/:projectName",
  parseRequest({
    params: z.object({
      projectName: z.string(),
    }),
  }),
  handleAsync(async (req, res) => {
    const { username } = req.app.locals;
    const { projectName } = req.params;

    const projectService = container.get<ProjectService>("ProjectService");
    const userService = container.get<UserService>("UserService");

    await projectService.deleteProject({ projectName });
    await userService.deleteProject({ username, projectName });

    return res.status(204).json({
      message: "ok",
    });
  }),
);

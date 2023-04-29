import { Router } from "express";
import { z } from "zod";
import { omit } from "lodash";
import createError from "http-errors";

import { parseRequest } from "../middlewares/parseRequest";
import { verifyAccessToken } from "../middlewares/verifyAccessToken";
import { BUILD_MESSAGE } from "../../config/constants";
import { ProjectService } from "../../domains/projectService";
import { UserService } from "../../domains/userService";
import { container } from "../../config/di.config";
import { handleAsync } from "../utils/handleAsync";
import { Logger as log } from "../../utils/Logger";
import Config from "../../config";

import type { TokenClient } from "../../config/di.config";

const project = z.object({
  userId: z.string(),
  space: z.string(),
  repoName: z.string(),
  repoCloneUrl: z.string(),
  projectName: z.string(),
  projectUpdatedAt: z.string(),
  framework: z.union([
    z.literal("Create React App"),
    z.literal("React Static"),
    z.literal("Next.js (Static HTML Export)"),
    z.literal("Nuxt.js"),
    z.literal("Angular (Angular CLI)"),
    z.literal("Astro"),
    z.literal("Gatsby"),
    z.literal("GitBook"),
    z.literal("Jekyll"),
    z.literal("Remix"),
    z.literal("Svelte"),
    z.literal("Vue"),
    z.literal("VuePress"),
  ]),
  installCommand: z.string().default("npm install"),
  buildCommand: z.string().default("npm run build"),
  envList: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
  nodeVersion: z.string().default("12.18.0"),
});

const CLIENT_FRAMEWORK_INFO = {
  "Create React App": "CreateReactApp",
  "React Static": "ReactStatic",
  "Next.js (Static HTML Export)": "NextJs",
  "Nuxt.js": "NuxtJs",
  "Angular (Angular CLI)": "Angular",
  Astro: "Astro",
  Gatsby: "Gatsby",
  GitBook: "GitBook",
  Jekyll: "Jekyll",
  Remix: "Remix",
  Svelte: "Svelte",
  Vue: "Vue",
  VuePress: "VuePress",
} as const;

export const projectsRouter = Router();

projectsRouter.use("/projects", verifyAccessToken);

projectsRouter.post(
  "/projects",
  parseRequest({
    body: project,
  }),
  handleAsync(async (req, res) => {
    const projectOptions = req.body;
    const { projectName, userId } = projectOptions;

    const tokenClient = container.get<TokenClient>("JwtTokenClient");
    const storageKey = tokenClient.createToken({
      payload: { projectName },
      key: Config.STORAGE_JWT_SECRET,
    });

    res.status(201).json({
      message: "ok",
      result: {
        projectName,
        storageKey,
      },
    });

    const projectService = container.get<ProjectService>("ProjectService");
    const userService = container.get<UserService>("UserService");
    const createProjectOptions = omit(projectOptions, ["userId"]);

    try {
      await projectService.createProject({
        ...createProjectOptions,
        storageKey,
        framework: CLIENT_FRAMEWORK_INFO[createProjectOptions.framework],
        schemaList: [],
      });
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

    const [framework] =
      Object.entries(CLIENT_FRAMEWORK_INFO).find(
        ([clientValue, serverValue]) => serverValue === project.framework,
      ) ?? [];

    return res.json({
      message: "ok",
      result: {
        ...project,
        framework,
      },
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

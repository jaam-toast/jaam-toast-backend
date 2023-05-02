import { Router } from "express";
import createError from "http-errors";
import { z } from "zod";

import Config from "../../@config";
import { container } from "../../@config/di.config";
import { ProjectStatus } from "../../@types/project";
import { parseRequest } from "../middlewares/parseRequest";
import { verifyAccessToken } from "../middlewares/verifyAccessToken";
import { handleAsync } from "../utils/handleAsync";
import { emitEvent } from "../../@utils/emitEvent";

import type { Project } from "../../@types/project";
import type { Repository } from "../../@config/di.config";
import type { TokenClient } from "../../@config/di.config";

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

const project = z.object({
  userId: z.string(),
  space: z.string(),
  repoName: z.string(),
  repoCloneUrl: z.string(),
  projectName: z.string(),
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

export const projectsRouter = Router();

projectsRouter.use("/projects", verifyAccessToken);

projectsRouter.post(
  "/projects",
  parseRequest({
    body: project,
  }),
  handleAsync(async (req, res, next) => {
    const projectRepository =
      container.get<Repository<Project>>("ProjectRepository");
    const tokenClient = container.get<TokenClient>("JwtTokenClient");

    const { projectName, framework } = req.body;
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!!project) {
      return next(createError(400, "Project is already exist."));
    }

    res.status(201).json({
      message: "ok",
    });

    const storageKey = tokenClient.createToken({
      payload: { projectName },
      key: Config.STORAGE_JWT_SECRET,
    });

    emitEvent("CREATE_PROJECT", {
      ...req.body,
      status: ProjectStatus.pending,
      framework: CLIENT_FRAMEWORK_INFO[framework],
      schemaList: [],
      storageKey,
    });

    emitEvent("CREATE_STORAGE", {
      projectName,
    });
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
    const projectRepository =
      container.get<Repository<Project>>("ProjectRepository");

    const { projectName } = req.params;
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      return next(createError(404, "Project data does not exist."));
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
    const { userId } = req.app.locals;
    const { projectName } = req.params;

    return res.status(204).json({
      message: "ok",
    });
  }),
);

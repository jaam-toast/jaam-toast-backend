import { Router } from "express";
import createError from "http-errors";
import { z } from "zod";
import { isEmpty } from "lodash";

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

export const projectsRouter = Router();

projectsRouter.use("/projects", verifyAccessToken);

projectsRouter.post(
  "/projects",
  parseRequest({
    query: z
      .object({
        repository: z.string().optional(),
      })
      .optional(),
  }),
  handleAsync(async (req, res, next) => {
    if (!req.query) {
      return next();
    }

    /**
     * Update Project
     */
    const projectRepository =
      container.get<Repository<Project>>("ProjectRepository");

    const { repository } = req.query;

    if (!repository) {
      return next(createError(400, "Bad Request"));
    }

    const projects = await projectRepository.readDocument({
      filter: { repoCloneUrl: repository },
    });

    if (isEmpty(projects)) {
      return next(createError(404, "Projects Not Found"));
    }

    projects.forEach(project => {
      if (!project?.projectName) {
        return;
      }

      emitEvent("UPDATE_PROJECT", {
        projectName: project.projectName,
      });
    });

    res.status(200).json({
      message: "ok",
    });
  }),
  parseRequest({
    body: z.object({
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
    }),
  }),
  handleAsync(async (req, res, next) => {
    /**
     * Create a new Project
     */
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

    const storageKey = tokenClient.createToken({
      payload: { projectName },
      key: Config.STORAGE_JWT_SECRET,
    });

    emitEvent("CREATE_PROJECT", {
      ...req.body,
      status: ProjectStatus.Pending,
      framework: CLIENT_FRAMEWORK_INFO[framework],
      storageKey,
    });

    res.status(201).json({
      message: "ok",
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

    emitEvent("DELETE_PROJECT", { userId, projectName });

    return res.status(204).json({
      message: "ok",
    });
  }),
);

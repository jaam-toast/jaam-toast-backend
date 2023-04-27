import { Router } from "express";
import { z } from "zod";
import { ObjectId } from "mongodb";

import { parseRequest } from "../middlewares/parseRequest";
import { handleAsync } from "../utils/handleAsync";
import { container } from "../../domains/@config/di.config";
import { ProjectService } from "../../domains/projectService";
import { TokenClient } from "../../infrastructure/jwtTokenClient";
import Config from "../../config";

export const storageRouter = Router();

storageRouter.use(
  "/storage",
  handleAsync(async (req, res, next) => {
    const storageKey = req.headers.authorization?.replace("Bearer ", "") ?? "";
    const tokenClient = container.get<TokenClient>("JwtTokenClient");

    const payload = tokenClient.validateToken({
      token: storageKey,
      key: Config.STORAGE_JWT_SECRET,
    });

    if (!payload) {
      return res.status(401).json({
        message: "not authorized",
      });
    }

    req.app.locals.projectName = payload.projectName;

    next();
  }),
);

storageRouter.post(
  "/storage/:schemaName/contents",
  parseRequest({
    params: z.object({
      schemaName: z.string(),
    }),
    body: z.record(z.string()),
  }),
  handleAsync(async (req, res, next) => {
    const { schemaName } = req.params;
    const { projectName } = req.app.locals;
    const projectService = container.get<ProjectService>("ProjectService");

    const contents = await projectService.createContents({
      projectName,
      schemaName,
      contents: req.body,
    });

    return res.status(201).json({
      message: "ok",
      result: contents,
    });
  }),
);

storageRouter.get(
  "/storage/:schemaName/contents",
  parseRequest({
    params: z.object({
      schemaName: z.string(),
    }),
    query: z.object({
      page: z.string(),
      pageLength: z.string(),
      sort: z.union([z.string(), z.array(z.string())]),
      order: z.union([z.string(), z.array(z.string())]),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schemaName } = req.params;
    const { page, pageLength, sort, order } = req.query;
    const projectService = container.get<ProjectService>("ProjectService");

    const pagination = {
      ...(page && { page: Number(page) }),
      ...(pageLength && { pageLength: Number(pageLength) }),
    };

    const sortOptions: {
      [key: string]: string;
    }[] = (() => {
      if (Array.isArray(sort)) {
        if (Array.isArray(order)) {
          return sort.map((sort, index) => ({
            [sort]: typeof order[index] === "string" ? order[index] : "asc",
          }));
        }
        if (typeof order === "string") {
          return sort.map((sort, index) =>
            index === 0 ? { [sort]: order } : { [sort]: "asc" },
          );
        }
        if (!order) {
          return sort.map(sort => ({ [sort]: "asc" }));
        }
      }
      if (typeof sort === "string") {
        if (Array.isArray(order) && typeof order[0] === "string") {
          return [{ [sort]: order[0] }];
        }
        if (typeof order === "string") {
          return [{ [sort]: order }];
        }
        if (!order) {
          return [{ [sort]: "asc" }];
        }
      }

      return [];
    })();

    const contents = await projectService.getContents({
      projectName,
      schemaName,
      pagination,
      sort: sortOptions,
    });

    return res.status(200).json({
      message: "ok",
      result: contents,
    });
  }),
);

storageRouter.get(
  "/storage/:schemaName/contents/:contentsId",
  parseRequest({
    params: z.object({
      schemaName: z.string(),
      contentsId: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schemaName, contentsId } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");

    const contents = await projectService.getContents({
      projectName,
      schemaName,
      // TODO: change logic.
      filter: { _id: new ObjectId(contentsId) },
    });

    return res.status(200).json({
      message: "ok",
      result: contents[0],
    });
  }),
);

storageRouter.put(
  "/storage/:schemaName/contents/:contentsId",
  parseRequest({
    params: z.object({
      schemaName: z.string(),
      contentsId: z.string(),
    }),
    body: z.record(z.unknown()),
  }),
  handleAsync(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schemaName, contentsId } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");

    await projectService.updateContents({
      projectName,
      schemaName,
      contentsId,
      contents: req.body,
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

storageRouter.delete(
  "/storage/:schemaName/contents/:contentsId",
  parseRequest({
    params: z.object({
      schemaName: z.string(),
      contentsId: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schemaName, contentsId } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");

    await projectService.deleteContents({
      projectName,
      schemaName: schemaName,
      contentsIds: [contentsId],
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

storageRouter.delete(
  "/storage/:schemaName/contents",
  parseRequest({
    params: z.object({
      schemaName: z.string(),
    }),
    query: z.object({
      contentsId: z.union([z.string(), z.array(z.string())]),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schemaName } = req.params;
    const { contentsId } = req.query;
    const projectService = container.get<ProjectService>("ProjectService");

    await projectService.deleteContents({
      projectName,
      schemaName: schemaName,
      contentsIds: Array.isArray(contentsId) ? contentsId : [contentsId],
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

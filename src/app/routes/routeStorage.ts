import { Router } from "express";
import createError from "http-errors";
import { z } from "zod";
import { omit } from "lodash";

import Config from "../../@config";
import { container } from "../../@config/di.config";
import { parseRequest } from "../middlewares/parseRequest";
import { handleAsync } from "../utils/handleAsync";

import type { TokenClient } from "../../@config/di.config";
import type { ContentService } from "../../domains/ContentsService";

export const storageRouter = Router();

storageRouter.use(
  "/storage",
  handleAsync(async (req, res, next) => {
    const tokenClient = container.get<TokenClient>("JwtTokenClient");

    const storageKey = req.headers.authorization?.replace("Bearer ", "") ?? "";
    const payload = tokenClient.validateToken({
      token: storageKey,
      key: Config.STORAGE_JWT_SECRET,
    });

    if (!payload) {
      return next(createError(401, "not authorized"));
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
    body: z.record(z.unknown()),
  }),
  handleAsync(async (req, res, next) => {
    const contentService = container.get<ContentService>("ContentService");

    const { schemaName } = req.params;
    const { projectName } = req.app.locals;

    const content = await contentService.createContent({
      projectName,
      schemaName,
      content: req.body,
    });

    return res.status(201).json({
      message: "ok",
      result: content,
    });
  }),
);

storageRouter.get(
  "/storage/:schemaName/contents",
  parseRequest({
    params: z.object({
      schemaName: z.string(),
    }),
    query: z
      .object({
        page: z.string().optional(),
        pageLength: z.string().optional(),
        sort: z.union([z.string(), z.array(z.string())]).optional(),
        order: z.union([z.string(), z.array(z.string())]).optional(),
      })
      .optional(),
  }),
  handleAsync(async (req, res, next) => {
    const contentService = container.get<ContentService>("ContentService");

    const { projectName } = req.app.locals;
    const { schemaName } = req.params;
    const { page, pageLength, sort, order } = req?.query ?? {};

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

    const contents = await contentService.queryContents({
      projectName,
      schemaName,
      pagination,
      sort: sortOptions,
    });

    const totalCounts = await contentService.getContentsTotalCounts({
      projectName,
      schemaName,
    });

    return res.status(200).json({
      message: "ok",
      result: {
        totalCounts,
        contents,
      },
    });
  }),
);

storageRouter.get(
  "/storage/:schemaName/contents/:contentId",
  parseRequest({
    params: z.object({
      schemaName: z.string(),
      contentId: z.string(),
    }),
  }),
  handleAsync(async (req, res) => {
    const contentService = container.get<ContentService>("ContentService");

    const { projectName } = req.app.locals;
    const { schemaName, contentId } = req.params;
    const [content] = await contentService.queryContents({
      projectName,
      schemaName,
      contentId,
    });

    return res.status(200).json({
      message: "ok",
      result: content,
    });
  }),
);

storageRouter.put(
  "/storage/:schemaName/contents/:contentId",
  parseRequest({
    params: z.object({
      schemaName: z.string(),
      contentId: z.string(),
    }),
    body: z.record(z.unknown()),
  }),
  handleAsync(async (req, res, next) => {
    const contentService = container.get<ContentService>("ContentService");

    const { projectName } = req.app.locals;
    const { schemaName, contentId } = req.params;

    await contentService.updateContent({
      projectName,
      schemaName,
      contentId,
      content: omit(req.body, ["_id"]),
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

storageRouter.delete(
  "/storage/:schemaName/contents/:contentId",
  parseRequest({
    params: z.object({
      schemaName: z.string(),
      contentId: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const contentService = container.get<ContentService>("ContentService");

    const { projectName } = req.app.locals;
    const { schemaName, contentId } = req.params;

    await contentService.deleteContent({
      projectName,
      schemaName: schemaName,
      contentIds: [contentId],
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
      contentId: z.union([z.string(), z.array(z.string())]),
    }),
  }),
  handleAsync(async (req, res) => {
    const contentService = container.get<ContentService>("ContentService");

    const { projectName } = req.app.locals;
    const { schemaName } = req.params;
    const { contentId } = req.query;

    await contentService.deleteContent({
      projectName,
      schemaName: schemaName,
      contentIds: Array.isArray(contentId) ? contentId : [contentId],
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

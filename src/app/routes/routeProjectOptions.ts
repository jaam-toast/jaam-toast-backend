import { Router } from "express";
import { z } from "zod";
import createError from "http-errors";
import { isEmpty } from "lodash";

import { parseRequest } from "../middlewares/parseRequest";
import { verifyAccessToken } from "../middlewares/verifyAccessToken";
import { emitEvent } from "../../@utils/emitEvent";
import { handleAsync } from "../utils/handleAsync";

export const projectOptionssRouter = Router();

projectOptionssRouter.use("/projects/:projectName/options", verifyAccessToken);

projectOptionssRouter.post(
  "/projects/:projectName/options",
  parseRequest({
    query: z.object({
      projectName: z.string(),
    }),
    body: z.object({
      installCommand: z.string().optional(),
      buildCommand: z.string().optional(),
      envList: z
        .array(
          z.object({
            key: z.string(),
            value: z.string(),
          }),
        )
        .optional(),
    }),
  }),
  handleAsync((req, res, next) => {
    const { projectName } = req.query;

    emitEvent("UPDATE_PROJECT", { projectName, ...req.body });

    res.status(200).json({
      message: "ok",
    });
  }),
);

projectOptionssRouter.patch(
  "/projects/:projectName/options",
  parseRequest({
    query: z.object({
      projectName: z.string(),
    }),
    body: z.object({
      buildDomain: z.string().optional(),
      webhook: z
        .object({
          name: z.string(),
          url: z.string(),
          events: z.array(
            z.union([
              z.literal("DEPLOYMENT_UPDATED"),
              z.literal("CONTENT_CREATED"),
              z.literal("CONTENT_UPDATED"),
              z.literal("CONTENT_DELETED"),
            ]),
          ),
        })
        .optional(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    if (isEmpty(req.body)) {
      return next(createError(400, "Fill"));
    }

    const { projectName } = req.query;
    const { buildDomain, webhook } = req.body;

    emitEvent("ADD_PROJECT_OPTIONS", { projectName, buildDomain, webhook });
  }),
);

projectOptionssRouter.delete(
  "/projects/:projectName/options",
  parseRequest({
    query: z.object({
      projectName: z.string(),
    }),
    body: z.object({
      buildDomain: z.string().optional(),
      webhook: z
        .object({
          name: z.string(),
          url: z.string(),
          events: z.array(
            z.union([
              z.literal("DEPLOYMENT_UPDATED"),
              z.literal("CONTENT_CREATED"),
              z.literal("CONTENT_UPDATED"),
              z.literal("CONTENT_DELETED"),
            ]),
          ),
        })
        .optional(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    if (isEmpty(req.body)) {
      return next(createError(400, "Fill"));
    }

    const { projectName } = req.query;
    const { buildDomain, webhook } = req.body;

    emitEvent("REMOVE_PROJECT_OPTIONS", { projectName, buildDomain, webhook });

    return res.json({ message: "ok" });
  }),
);

import { Router } from "express";
import Joi from "joi";
import { omit } from "lodash";

import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../middlewares/validateRequest";
import { container } from "src/domains/@config/di.config";
import { ProjectService } from "src/domains/projectService";
import { TokenClient } from "src/infrastructure/jwtTokenClient";
import Config from "src/config";

export const storageRouter = Router();

storageRouter.use(
  "/:schema_name",
  validateRequest(
    Joi.object({
      schema_name: Joi.string().required(),
    }),
    "params",
  ),
);

storageRouter.use(
  "/:schema_name",
  asyncHandler(async (req, res, next) => {
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
  "/:schema_name/contents",
  asyncHandler(async (req, res, next) => {
    const { schema_name: schemaName } = req.params;
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
  "/:schema_name/contents",
  asyncHandler(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { page, sort, ...filter } = req.query;
    const { schema_name: schemaName } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");

    const queryFilter = !!filter.contents_id
      ? { ...omit(filter, ["contents_id"]), contentsId: filter.contents_id }
      : filter;
    const contents = await projectService.queryContents({
      projectName,
      schemaName,
      queryOptions: {
        sort,
        filter: queryFilter,
        page: page ?? 0,
      },
    });

    return res.status(200).json({
      message: "ok",
      result: contents,
    });
  }),
);

storageRouter.put(
  "/:schema_name/contents/:contents_id",
  asyncHandler(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schema_name: schemaName, contents_id: contentsId } = req.params;
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
  "/:schema_name/contents",
  asyncHandler(async (req, res, next) => {
    const { projectName } = req.app.locals;
    const { schema_name: schemaName } = req.params;
    const { contents_id: contentsId } = req.query;
    const projectService = container.get<ProjectService>("ProjectService");

    await projectService.deleteContents({
      projectName,
      schemaName: schemaName as string,
      contentsIds: Array.isArray(contentsId)
        ? (contentsId as string[])
        : [contentsId as string],
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

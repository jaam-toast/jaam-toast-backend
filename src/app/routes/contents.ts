import { Router } from "express";
import Joi from "joi";
import { omit } from "lodash";

import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../middlewares/validateRequest";
import { container } from "src/domains/@config/di.config";
import { ProjectService } from "src/domains/projectService";

export const contentsRouter = Router();

contentsRouter.use(
  "/:schema_name",
  validateRequest(
    Joi.object({
      schema_name: Joi.string().required(),
    }),
    "params",
  ),
);

contentsRouter.post(
  "/:schema_name",
  asyncHandler(async (req, res, next) => {
    const { schema_name: schemaName } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");
    const contents = await projectService.createContents({
      schemaName,
      contents: req.body,
    });

    return res.status(201).json({
      message: "ok",
      result: contents,
    });
  }),
);

contentsRouter.get(
  "/:schema_name",
  asyncHandler(async (req, res, next) => {
    const { page, sort, ...query } = req.query;
    const { schema_name: schemaName } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");
    const contents = await projectService.queryContents({
      schemaName,
      page: page ?? 0,
      query,
      sort,
    });

    return res.status(200).json({
      message: "ok",
      result: contents,
    });
  }),
);

contentsRouter.get(
  "/:schema_name/:contents_id",
  asyncHandler(async (req, res, next) => {
    const { schema_name: schemaName, contents_id: contentsId } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");
    const contents = await projectService.queryContents({
      schemaName,
      query: { contentsId },
    });

    return res.status(200).json({
      message: "ok",
      result: contents,
    });
  }),
);

contentsRouter.put(
  "/:schema_name/:contents_id",
  asyncHandler(async (req, res, next) => {
    const { schema_name: schemaName } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");

    await projectService.updateContents({
      schemaName,
      contents: req.body,
    });

    return res.status(201).json({
      message: "ok",
    });
  }),
);

contentsRouter.delete(
  "/:schema_name/:contents_id",
  asyncHandler(async (req, res, next) => {
    const { schema_name: schemaName } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");

    await projectService.deleteContents({
      schemaName,
      contents: req.body,
    });

    return res.status(201).json({
      message: "ok",
    });
  }),
);

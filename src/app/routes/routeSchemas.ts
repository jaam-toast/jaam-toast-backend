import { Router } from "express";
import createError from "http-errors";
import { z } from "zod";

import { parseRequest } from "../middlewares/parseRequest";
import { handleAsync } from "../utils/handleAsync";
import { container } from "../../@config/di.config";

import type { StorageService } from "../../domains/StorageService";
import type { Repository } from "../../@config/di.config";
import type { Project } from "../../@types/project";

export const schema = z.object({
  schemaName: z.string(),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    type: z.literal("object"),
    properties: z.record(
      z.object({
        type: z.string(),
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        minimum: z.number().optional(),
        maximum: z.number().optional(),
        description: z.string().optional(),
        format: z.string().optional(),
      }),
    ),
    required: z.array(z.string()).optional(),
  }),
});

export const schemasRouter = Router();

schemasRouter.post(
  "/projects/:projectName/schemas",
  parseRequest({
    body: schema,
    params: z.object({
      projectName: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const storageService = container.get<StorageService>("StorageService");
    const projectRepository =
      container.get<Repository<Project>>("ProjectRepository");

    const { schemaName, schema } = req.body;
    const { projectName } = req.params;
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      return next(createError(404, "Cannot find project."));
    }

    const isSchemaExist = !!project.schemaList.find(
      proejctSchema => proejctSchema.schemaName === schemaName,
    );

    if (isSchemaExist) {
      return next(createError(400, "Schema is already exist."));
    }

    await storageService.addSchema({
      projectName,
      schemaName,
      schema,
    });

    return res.status(201).json({
      message: "ok",
    });
  }),
);

schemasRouter.put(
  "/projects/:projectName/schemas/:schemaName",
  parseRequest({
    body: schema,
    params: z.object({
      projectName: z.string(),
      schemaName: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const storageService = container.get<StorageService>("StorageService");
    const projectRepository =
      container.get<Repository<Project>>("ProjectRepository");

    const { schemaName, projectName } = req.params;
    const { schema } = req.body;
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      return next(createError(404, "Cannot find project."));
    }

    const isSchemaExist = !!project.schemaList.find(
      proejctSchema => proejctSchema.schemaName === schemaName,
    );

    if (!isSchemaExist) {
      return next(createError(404, "Cannot find schema."));
    }

    await storageService.updateSchema({
      projectName,
      schemaName: schema.title,
      schema,
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

schemasRouter.delete(
  "/projects/:projectName/schemas/:schemaName",
  parseRequest({
    params: z.object({
      projectName: z.string(),
      schemaName: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const storageService = container.get<StorageService>("StorageService");
    const projectRepository =
      container.get<Repository<Project>>("ProjectRepository");

    const { projectName, schemaName } = req.params;
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      return next(createError(404, "Cannot find project."));
    }

    const isSchemaExist = !!project.schemaList.find(
      proejctSchema => proejctSchema.schemaName === schemaName,
    );

    if (!isSchemaExist) {
      return next(createError(404, "Cannot find schema."));
    }

    await storageService.deleteSchema({
      projectName,
      schemaName,
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

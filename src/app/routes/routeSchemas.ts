import { Router } from "express";
import { z } from "zod";

import { parseRequest } from "../middlewares/parseRequest";
import { handleAsync } from "../utils/handleAsync";
import { container } from "../../domains/@config/di.config";
import { ProjectService } from "../../domains/projectService";

export const schemasRouter = Router();

const schemaProperty = z.object({
  type: z.string(),
  minLength: z
    .string()
    .refine(val => !!Number(val))
    .transform(val => Number(val))
    .optional(),
  maxLength: z
    .string()
    .refine(val => !!Number(val))
    .transform(val => Number(val))
    .optional(),
  minimum: z
    .string()
    .refine(val => !!Number(val))
    .transform(val => Number(val))
    .optional(),
  maximum: z
    .string()
    .refine(val => !!Number(val))
    .transform(val => Number(val))
    .optional(),
  description: z.string().optional(),
  format: z.string().optional(),
});

schemasRouter.post(
  "/projects/:projectName/schemas",
  parseRequest({
    body: z.object({
      schemaName: z.string(),
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        type: z.literal("object"),
        properties: z.record(schemaProperty),
        required: z.array(z.string()).optional(),
      }),
    }),
    params: z.object({
      projectName: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const { schemaName, schema } = req.body;
    const { projectName } = req.params;
    const projectService = container.get<ProjectService>("ProjectService");
    const project = await projectService.getByProjectName(projectName);

    if (!project) {
      return res.status(400).json({
        message: "Cannot find project.",
      });
    }

    const isSchemaExist = !!project.schemaList.find(
      proejctSchema => proejctSchema.schemaName === schemaName,
    );

    if (isSchemaExist) {
      return res.status(400).json({
        message: "Schema is already exist.",
      });
    }

    await projectService.addSchema({
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
    body: z.object({
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        type: z.literal("object"),
        properties: z.record(schemaProperty),
        required: z.array(z.string()).optional(),
      }),
    }),
    params: z.object({
      projectName: z.string(),
      schemaName: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const { schemaName, projectName } = req.params;
    const { schema } = req.body;
    const projectService = container.get<ProjectService>("ProjectService");
    const project = await projectService.getByProjectName(projectName);

    if (!project) {
      return res.status(400).json({
        message: "Cannot find project.",
      });
    }

    const isSchemaExist = !!project.schemaList.find(
      proejctSchema => proejctSchema.schemaName === schemaName,
    );

    if (!isSchemaExist) {
      return res.status(400).json({
        message: "Cannot find schema.",
      });
    }

    await projectService.updateSchema({
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
    const projectService = container.get<ProjectService>("ProjectService");
    const { projectName, schemaName } = req.params;
    const project = await projectService.getByProjectName(projectName);

    if (!project) {
      return res.status(400).json({
        message: "Cannot find project.",
      });
    }

    const isSchemaExist = !!project.schemaList.find(
      proejctSchema => proejctSchema.schemaName === schemaName,
    );

    if (!isSchemaExist) {
      return res.status(400).json({
        message: "Cannot find schema.",
      });
    }

    await projectService.deleteSchema({
      projectName,
      schemaName,
    });

    return res.status(200).json({
      message: "ok",
    });
  }),
);

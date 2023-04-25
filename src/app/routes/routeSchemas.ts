import { Router } from "express";
import { z } from "zod";
import Ajv from "ajv";

import { parseRequest } from "../middlewares/parseRequest";
import { handleAsync } from "../utils/handleAsync";
import { container } from "../../domains/@config/di.config";
import { ProjectService } from "../../domains/projectService";

const ajv = new Ajv();

export const schemasRouter = Router();

schemasRouter.post(
  "/projects/:projectName/schemas",
  parseRequest({
    body: z.object({
      schemaName: z.string(),
      schema: z.object({
        title: z.string(),
      }),
    }),
    params: z.object({
      projectName: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const { schemaName, schema } = req.body;
    const { projectName } = req.params;

    try {
      ajv.compile(schema);
    } catch (error) {
      return res.status(400).json({
        message: "The schema field is not of JSON Schema or failed validation.",
      });
    }

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

    try {
      ajv.compile(schema);
    } catch (error) {
      return res.status(400).json({
        message: "The schema field is not of JSON Schema or failed validation.",
      });
    }

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

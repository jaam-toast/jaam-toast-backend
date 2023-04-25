import { Router } from "express";
import Joi from "joi";
import Ajv from "ajv-draft-04";

import { validateRequest } from "../middlewares/validateRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { container } from "../../domains/@config/di.config";
import { ProjectService } from "../../domains/projectService";
import { TokenClient } from "../../infrastructure/jwtTokenClient";
import Config from "../../config";

const ajv = new Ajv();

export const schemasRouter = Router();

schemasRouter.use(
  "/:project_name",
  validateRequest(
    Joi.object({
      project_name: Joi.string().required(),
    }),
    "params",
  ),
);

schemasRouter.post(
  "/:project_name/schemas",
  validateRequest(
    Joi.object({
      schema_name: Joi.string().required(),
      schema: Joi.object({
        title: Joi.string().required(),
      }),
    }),
    "body",
  ),
  asyncHandler(async (req, res, next) => {
    const { schema_name: schemaName, schema } = req.body;

    try {
      ajv.compile(schema);
    } catch (error) {
      return res.status(400).json({
        message: "The schema field is not of JSON Schema or failed validation.",
      });
    }

    const projectService = container.get<ProjectService>("ProjectService");
    const tokenClient = container.get<TokenClient>("JwtTokenClient");
    const { project_name: projectName } = req.params;
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

    const storageKey = tokenClient.createToken({
      payload: { projectName },
      key: Config.STORAGE_JWT_SECRET,
    });

    return res.status(201).json({
      message: "ok",
      result: {
        storageName: schemaName,
        storageKey,
      },
    });
  }),
);

schemasRouter.put(
  "/:project_name/schemas/:schema_name",
  validateRequest(
    Joi.object({
      schema: Joi.object({
        title: Joi.string().required(),
      }),
    }),
    "body",
  ),
  asyncHandler(async (req, res, next) => {
    const { schema_name: schemaName } = req.params;
    const { schema } = req.body;

    try {
      ajv.compile(schema);
    } catch (error) {
      return res.status(400).json({
        message: "The schema field is not of JSON Schema or failed validation.",
      });
    }

    const projectService = container.get<ProjectService>("ProjectService");
    const { project_name: projectName } = req.params;
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
  "/:project_name/schemas/:schema_name",
  asyncHandler(async (req, res, next) => {
    const projectService = container.get<ProjectService>("ProjectService");
    const { project_name: projectName, schema_name: schemaName } = req.params;
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

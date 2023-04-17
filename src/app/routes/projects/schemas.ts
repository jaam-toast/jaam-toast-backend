import { Router } from "express";
import Joi from "joi";
import Ajv from "ajv";

import { validateRequest } from "src/app/middlewares/validateRequest";
import { asyncHandler } from "src/app/utils/asyncHandler";
import { container } from "src/domains/@config/di.config";
import { ProjectService } from "src/domains/projectService";

export const schemasRouter = Router();
const ajv = new Ajv();

schemasRouter.use(
  validateRequest(
    Joi.object({
      project_name: Joi.string().required(),
    }),
    "params",
  ),
);

schemasRouter.post(
  "/",
  asyncHandler(async (req, res, next) => {
    ajv.compile(req.body); // validate 로직

    res.status(201).json({
      message: "ok",
    });
  }),
);

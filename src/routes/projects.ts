import { Router } from "express";

import Joi from "joi";

import {
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from "@src/controllers/project";

import verifyToken from "@src/middlewares/verifyToken";
import validateSchema from "@src/middlewares/validateSchema";

const route = Router();

const projectsRouter = (app: Router) => {
  app.use("/projects", verifyToken, route);

  route.post("/", createProject);

  route.get(
    "/:project_name",
    validateSchema(
      Joi.object({
        project_name: Joi.string().regex(/^[a-zA-Z0-9]+$/i),
      }),
      "params[project_name]",
    ),
    getProject,
  );

  route.put(
    "/:project_name",
    validateSchema(
      Joi.object({
        project_name: Joi.string().regex(/^[a-zA-Z0-9]+$/i),
      }),
      "params[project_name]",
    ),
    updateProject,
  );

  route.delete(
    "/:project_name",
    validateSchema(
      Joi.object({
        project_name: Joi.string().regex(/^[a-zA-Z0-9]+$/i),
      }),
      "params[project_name]",
    ),
    deleteProject,
  );
};

export default projectsRouter;

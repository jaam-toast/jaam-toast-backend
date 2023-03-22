import { Router } from "express";

import Joi from "joi";

import {
  createProject,
  getUserProjects,
  updateProject,
  deleteProject,
} from "@src/controllers/project";

import verifyToken from "@src/middlewares/verifyToken";
import validateSchema from "@src/middlewares/validateSchema";

const route = Router();

const projectsRouter = (app: Router) => {
  app.use("/projects", verifyToken, route);

  route.post("/", createProject);

  route.post(
    "/:projectId",
    validateSchema(
      Joi.object({
        projectId: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params[projectId]",
    ),
    updateProject,
  );

  route.get(
    "/:projectId",
    validateSchema(
      Joi.object({
        projectId: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params[projectId]",
    ),
    getUserProjects,
  );

  route.delete(
    "/:projectId",
    validateSchema(
      Joi.object({
        projectId: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params[projectId]",
    ),
    deleteProject,
  );
};

export default projectsRouter;

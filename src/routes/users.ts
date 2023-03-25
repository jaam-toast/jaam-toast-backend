import { Router } from "express";

import Joi from "joi";

import * as UserController from "@src/controllers/user";
import verifyToken from "@src/middlewares/verifyToken";
import validateSchema from "@src/middlewares/validateSchema";

const route = Router();

const usersRouter = (app: Router) => {
  app.use("/users", verifyToken, route);

  route.get(
    "/:user_id/orgs",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params",
    ),
    UserController.getOrganizations,
  );

  route.get(
    "/:user_id/repos",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params",
    ),
    UserController.getUserRepos,
  );

  route.get(
    "/:user_id/projects",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params",
    ),
    UserController.getUserProjects,
  );

  route.get(
    "/:user_id/orgs/:org/repos",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params[user_id]",
    ),
    UserController.getOrganizationRepos,
  );
};

export default usersRouter;

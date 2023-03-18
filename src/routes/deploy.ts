import { Router } from "express";

import Joi from "joi";

import {
  deployProject,
  deleteDeployment,
  getUserDeployList,
} from "@src/controllers/deploy";
import verifyToken from "@src/middlewares/verifyToken";
import validateSchema from "@src/middlewares/validateSchema";

const route = Router();

const deployRouter = (app: Router) => {
  app.use("/deploy", verifyToken, route);

  route.post(
    "/:user_id",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params[user_id]",
    ),
    deployProject,
  );

  route.get(
    "/:user_id",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params[user_id]",
    ),
    getUserDeployList,
  );

  route.delete(
    "/:user_id/:repo_id",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params[user_id]",
    ),
    deleteDeployment,
  );
};

export default deployRouter;

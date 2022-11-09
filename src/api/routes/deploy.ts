import { Router } from "express";

import Joi from "joi";

import verifyToken from "../middlewares/verifyToken";
import validateSchema from "../middlewares/validateSchema";

import * as DeployController from "../controllers/deployUserRepo";

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
    DeployController.deployUserRepo,
  );
};

export default deployRouter;

import { Router } from "express";

import Joi from "joi";

import verifyToken from "../api/middlewares/verifyToken";
import validateSchema from "../api/middlewares/validateSchema";

import * as DeployController from "../controllers/deployController";
import * as UpdateController from "../controllers/updateController";

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
    DeployController.deployInstance,
    DeployController.deployDomain,
    DeployController.deployCertbot,
    DeployController.deployLogs,
    DeployController.deploySaveData,
    DeployController.deployFilterData,
  );

  route.get(
    "/:user_id",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params[user_id]",
    ),
    DeployController.getUserDeployList,
  );

  route.delete(
    "/:user_id/:repo_id",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params[user_id]",
    ),
    UpdateController.deleteDeployment,
  );
};

export default deployRouter;

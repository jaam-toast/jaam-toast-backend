import { Router } from "express";

import verifyGithubSignature from "../middlewares/verifyGithubSignature";

import * as UpdateController from "../controllers/updateController";

const route = Router();

const reposRouter = (app: Router) => {
  app.use("/repos", route);

  route.post(
    "/hooks",
    verifyGithubSignature,
    UpdateController.updateDeployment,
  );
};

export default reposRouter;

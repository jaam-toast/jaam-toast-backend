import { Router } from "express";

import verifyGithubSignature from "../api/middlewares/verifyGithubSignature";

import * as UpdateController from "../api/controllers/updateController";

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

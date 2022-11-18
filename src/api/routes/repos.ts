import { Router } from "express";

import verifyGithubSignature from "../middlewares/verifyGithubSignature";

import * as UpdateController from "../controllers/updateUserRepo";

const route = Router();

const reposRouter = (app: Router) => {
  app.use("/repos", route);

  route.post("/hooks", verifyGithubSignature, UpdateController.updateUserRepo);
};

export default reposRouter;

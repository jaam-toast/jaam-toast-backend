import { updateDeployment } from "@src/controllers/deploy";
import verifyGithubSignature from "@src/middlewares/verifyGithubSignature";

import { Router } from "express";

const route = Router();

const reposRouter = (app: Router) => {
  app.use("/repos", route);

  route.post("/hooks", verifyGithubSignature, updateDeployment);
};

export default reposRouter;

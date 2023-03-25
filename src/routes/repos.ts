import { Router } from "express";

import { updateProject } from "@src/controllers/project";
import verifyGithubSignature from "@src/middlewares/verifyGithubSignature";

const route = Router();

const reposRouter = (app: Router) => {
  app.use("/repos", route);

  route.post("/hooks", verifyGithubSignature, updateProject);
};

export default reposRouter;

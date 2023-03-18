import * as AuthController from "@src/controllers/auth";
import verifyGithubCode from "@src/middlewares/verifyGithubCode";

import { Router } from "express";

const route = Router();

const loginRouter = (app: Router) => {
  app.use("/login", route);

  route.post("/", verifyGithubCode, AuthController.login);
};

export default loginRouter;

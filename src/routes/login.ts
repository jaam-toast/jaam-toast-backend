import { Router } from "express";

import verifyGithubCode from "../api/middlewares/verifyGithubCode";

import * as AuthController from "../controllers/auth";

const route = Router();

const loginRouter = (app: Router) => {
  app.use("/login", route);

  route.post("/", verifyGithubCode, AuthController.login);
};

export default loginRouter;

import { Router } from "express";

import * as AuthController from "@src/controllers/auth";
import verifyGithubCode from "@src/middlewares/verifyGithubCode";


const route = Router();

const loginRouter = (app: Router) => {
  app.use("/login", route);

  route.get("/", verifyGithubCode, AuthController.login);
};

export default loginRouter;

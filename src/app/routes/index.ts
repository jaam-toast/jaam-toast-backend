import { Router } from "express";

import loginRouter from "@src/app/routes/login";
import usersRouter from "@src/app/routes/users";
import projectsRouter from "@src/app/routes/projects";
import deploymentsRouter from "./deployments";
import reposRouter from "./repos";

const routes = (): Router => {
  const router = Router();

  loginRouter(router);
  usersRouter(router);
  projectsRouter(router);
  deploymentsRouter(router);
  reposRouter(router);

  return router;
};

export default routes;

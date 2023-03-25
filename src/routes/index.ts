import loginRouter from "@src/routes/login";
import projectsRouter from "@src/routes/projects";
import usersRouter from "@src/routes/users";
import reposRouter from "@src/routes/repos";

import { Router } from "express";

const routes = (): Router => {
  const router = Router();

  loginRouter(router);
  usersRouter(router);
  projectsRouter(router);
  reposRouter(router);

  return router;
};

export default routes;

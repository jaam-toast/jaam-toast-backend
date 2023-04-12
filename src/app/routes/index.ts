import { Router } from "express";

import loginRouter from "./login";
import usersRouter from "./users";
import projectsRouter from "./projects";
// import reposRouter from "./repos";

const routes = (): Router => {
  const router = Router();

  loginRouter(router);
  usersRouter(router);
  projectsRouter(router);
  // reposRouter(router);

  return router;
};

export default routes;

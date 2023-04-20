import { Router } from "express";

import loginRouter from "./login";
import usersRouter from "./users";
import { projectsRouter } from "./projects";
import { schemasRouter } from "./schemas";

const routes = (): Router => {
  const router = Router();

  loginRouter(router);
  usersRouter(router);

  router.use("/projects", projectsRouter);
  router.use("/projects", schemasRouter);

  return router;
};

export default routes;

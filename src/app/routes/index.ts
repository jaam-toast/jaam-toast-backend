import { Router } from "express";

import loginRouter from "./login";
import usersRouter from "./users";
import { projectsRouter } from "./projects";

const routes = (): Router => {
  const router = Router();

  loginRouter(router);
  usersRouter(router);

  router.use("/projects", projectsRouter);

  return router;
};

export default routes;

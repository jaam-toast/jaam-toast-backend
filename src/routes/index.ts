import { Router } from "express";

import loginRouter from "@src/routes/login";
import projectsRouter from "@src/routes/projects";
import usersRouter from "@src/routes/users";

const routes = (): Router => {
  const router = Router();

  loginRouter(router);
  usersRouter(router);
  projectsRouter(router);

  return router;
};

export default routes;

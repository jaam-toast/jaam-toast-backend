import loginRouter from "@src/routes/login";
import deployRouter from "@src/routes/deploy";
import usersRouter from "@src/routes/users";
import reposRouter from "@src/routes/repos";

import { Router } from "express";

const routes = (): Router => {
  const router = Router();

  loginRouter(router);
  usersRouter(router);
  deployRouter(router);
  reposRouter(router);

  return router;
};

export default routes;

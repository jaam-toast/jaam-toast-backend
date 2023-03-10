import { Router } from "express";

import morganMiddleware from "../middlewares/morganMiddleware";

import loginRouter from "./login";
import deployRouter from "./deploy";
import usersRouter from "./users";
import reposRouter from "./repos";

const routes = () => {
  const app = Router();

  app.use(morganMiddleware);

  loginRouter(app);
  usersRouter(app);
  deployRouter(app);
  reposRouter(app);

  return app;
};

export default routes;

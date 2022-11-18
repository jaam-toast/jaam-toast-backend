import { Router } from "express";

import morganMiddleware from "./middlewares/morganMiddleware";

import loginRouter from "./routes/login";
import deployRouter from "./routes/deploy";
import usersRouter from "./routes/users";
import reposRouter from "./routes/repos";

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

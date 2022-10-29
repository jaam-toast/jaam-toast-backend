import { Router } from "express";

import morganMiddleware from "./middlewares/morganMiddleware";

import loginRouter from "./routes/login";
import testRouter from "./routes/test";
import usersRouter from "./routes/users";

const routes = () => {
  const app = Router();

  app.use(morganMiddleware);

  loginRouter(app);
  usersRouter(app);
  testRouter(app);

  return app;
};

export default routes;

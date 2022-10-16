import { Router } from "express";

import morganMiddleware from "./middlewares/morganMiddleware";

import loginRouter from "./routes/login";
import usersRouter from "./routes/users";

const routes = () => {
  const app = Router();

  app.use(morganMiddleware);

  loginRouter(app);
  usersRouter(app);

  return app;
};

export default routes;

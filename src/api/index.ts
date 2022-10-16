import { Router } from "express";

import morganMiddleware from "./middlewares/morganMiddleware";

import loginRouter from "./routes/login";

const routes = () => {
  const app = Router();

  app.use(morganMiddleware);

  loginRouter(app);

  return app;
};

export default routes;

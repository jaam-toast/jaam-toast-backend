import { Router } from "express";

import morganMiddleware from "./middlewares/morganMiddleware";

import login from "./routes/login";

const routes = () => {
  const app = Router();

  app.use(morganMiddleware);

  login(app);

  return app;
};

export default routes;

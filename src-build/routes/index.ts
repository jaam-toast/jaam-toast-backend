import { Router } from "express";

import buildRouter from "./build";

const routes = (): Router => {
  const router = Router();

  buildRouter(router);

  return router;
};

export default routes;

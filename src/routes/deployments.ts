import { Router } from "express";

import { getDeployment, updateDeployment } from "@src/controllers/deployment";

const route = Router();

const deploymentsRouter = (app: Router) => {
  app.use("/deployments", route);

  route.get("/:deployment_id", getDeployment);

  route.put("/:deployment_id", updateDeployment);
};

export default deploymentsRouter;

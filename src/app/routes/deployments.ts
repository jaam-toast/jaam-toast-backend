import { Router } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import DB from "@src/services/DBService";

const route = Router();

const deploymentsRouter = (app: Router) => {
  app.use("/deployments", route);

  route.get(
    "/:deployment_id",
    asyncHandler(async (req, res, next) => {
      const { deployment_id } = req.params;
      const deployment = await DB.Deployment.findById(deployment_id);

      return res.json({
        message: "ok",
        result: deployment,
      });
    }),
  );

  route.put(
    "/:deployment_id",
    asyncHandler(async (req, res, next) => {
      const { deployment_id } = req.params;
      const updateOptions = req.body;

      const updatedDeployment = await DB.Deployment.findByIdAndUpdate(
        deployment_id,
        updateOptions,
      );

      return res.status(201).json({
        message: "ok",
        result: updatedDeployment,
      });
    }),
  );
};

export default deploymentsRouter;

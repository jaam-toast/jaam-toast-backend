import { Router } from "express";

import { createBuild, updateBuild, deleteBuild } from "../controllers/build";
import verifyToken from "../middlewares/verifyToken";

const route = Router();

const buildRouter = (app: Router) => {
  app.use("/build", route);

  route.post("/:project_id/:deployment_id", verifyToken, createBuild);

  route.put("/:project_id/:deployment_id", verifyToken, updateBuild);

  route.delete(
    "/:project_name/:instance_id/:public_ip_Address",
    verifyToken,
    deleteBuild,
  );

  route.delete("/:project_id", verifyToken, deleteBuild);
};

export default buildRouter;

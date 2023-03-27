import { Router } from "express";

import { createBuild, updateBuild, deleteBuild } from "../controllers/build";

const route = Router();

const buildRouter = (app: Router) => {
  app.use("/build", route);

  route.post("/:project_id/:deployment_id", createBuild);

  route.put("/:project_id/:deployment_id", updateBuild);

  route.delete("/:project_name/:instance_id/:public_ip_Address", deleteBuild);
};

export default buildRouter;

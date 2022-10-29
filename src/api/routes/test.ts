import { Router } from "express";
// import { run } from "../../lib/s3_upload_object";

const route = Router();

const testRouter = (app: Router) => {
  app.use("/test", route);

  route.get("/", (req, res, next) => {
    // run();
  });
};

export default testRouter;

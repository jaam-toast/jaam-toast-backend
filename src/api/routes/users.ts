import { Router } from "express";

import catchAsync from "../../utils/asyncHandler";

const route = Router();

const userRouter = (app: Router) => {
  app.use("/users", route);

  route.get(
    "/:user_id/data",
    catchAsync(async (req, res, next) => {}),
  );
};

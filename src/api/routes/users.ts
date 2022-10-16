import { Router } from "express";

import Joi from "joi";

import verifyToken from "../middlewares/verifyToken";
import validateSchema from "../middlewares/validateSchema";

const route = Router();

const usersRouter = (app: Router) => {
  app.use("/users", verifyToken, route);

  route.get(
    "/:user_id/data",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[0-9a-fA-F]{24}$}/),
      }),
      "params",
    ),
    (req, res, next) => {},
  );
};

export default usersRouter;

import { Router } from "express";

import Joi from "joi";

import verifyToken from "../middlewares/verifyToken";
import validateSchema from "../middlewares/validateSchema";

import * as UserController from "../controllers/user";

const route = Router();

const usersRouter = (app: Router) => {
  app.use("/users", verifyToken, route);

  route.get(
    "/:user_id/orgs",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params",
    ),
    UserController.getOrganizations,
  );
      }),
      "params",
    ),
    (req, res, next) => {},
  );
};

export default usersRouter;

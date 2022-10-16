import { Router } from "express";

import { joiUserSchema } from "../../models/User";

import validateSchema from "../middlewares/validateSchema";
import * as AuthController from "../controllers/auth";

const route = Router();

const loginRouter = (app: Router) => {
  app.use("/login", route);

  route.post("/", validateSchema(joiUserSchema, "body"), AuthController.login);
};

export default loginRouter;

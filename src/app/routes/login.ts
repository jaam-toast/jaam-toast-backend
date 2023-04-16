import { Router } from "express";
import jwt from "jsonwebtoken";

import verifyGithubCode from "../middlewares/verifyGithubCode";
import { asyncHandler } from "../utils/asyncHandler";
import Config from "../../config";
import validateRequest from "../middlewares/validateRequest";
import Joi from "joi";
import { container } from "src/domains/@config/inversify.config";
import { UserService } from "../../domains/userService";

const route = Router();

const loginRouter = (app: Router) => {
  app.use("/login", route);

  route.get(
    "/",
    verifyGithubCode,
    validateRequest(
      Joi.object({
        username: Joi.string().required(),
        userGithubUri: Joi.string().required(),
        userImage: Joi.string().required(),
        githubAccessToken: Joi.string().required(),
      }),
      "app[locals]",
    ),
    asyncHandler(async (req, res, next) => {
      const { username, userGithubUri, userImage, githubAccessToken } =
        req.app.locals;

      const userService = container.get<UserService>("UserService");
      const userData = await userService.login({
        username,
        userGithubUri,
        userImage,
        githubAccessToken,
      });

      const userPayload = {
        username: userData?.username,
        userGithubUri: userData?.userGithubUri,
        userImage: userData?.userImage,
      };

      const accessToken = jwt.sign(userPayload, Config.JWT_SECRET, {
        expiresIn: "1d",
      });

      // TODO - cookie 수정
      const { referer } = req.headers;
      const loginData = JSON.stringify({
        id: userData?._id,
        name: userData?.username,
        githubUri: userData?.userGithubUri,
        image: userData?.userImage,
        githubAccessToken,
        accessToken,
      });

      return res
        .cookie("loginData", loginData, {
          maxAge: 24 * 60 * 60 * 1000,
        })
        .redirect(referer ?? Config.CLIENT_URL);
    }),
  );
};

export default loginRouter;

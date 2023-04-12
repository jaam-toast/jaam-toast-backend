import { Router } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";

import { UserRepository } from "../../domains/repositories/userRepository";
import verifyGithubCode from "../middlewares/verifyGithubCode";
import { asyncHandler } from "../utils/asyncHandler";
import Config from "../../config";

const route = Router();

const loginRouter = (app: Router) => {
  app.use("/login", route);

  route.get(
    "/",
    verifyGithubCode,
    asyncHandler(async (req, res, next) => {
      const { username, userGithubUri, userImage, githubAccessToken } =
        req.app.locals;

      if (!username || !userGithubUri) {
        return next(createError(401));
      }

      let userData = await UserRepository.findOne({ userGithubUri });

      if (!userData) {
        userData = await UserRepository.create({
          username,
          userGithubUri,
          userImage,
          githubAccessToken,
        });
      }

      const userPayload = {
        username: userData?.username,
        userGithubUri: userData?.userGithubUri,
        userImage: userData?.userImage,
      };

      const accessToken = jwt.sign(userPayload, Config.JWT_SECRET, {
        expiresIn: "1d",
      });

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
          httpOnly: true,
        })
        .redirect(referer ?? Config.CLIENT_URL);
    }),
  );
};

export default loginRouter;

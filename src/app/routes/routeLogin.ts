import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import createError from "http-errors";

import { parseRequest } from "../middlewares/parseRequest";
import { handleAsync } from "../utils/handleAsync";
import { container } from "../../domains/@config/di.config";
import { UserService } from "../../domains/userService";
import { OauthClient } from "../../infrastructure/github";
import { Github } from "../../infrastructure/github";
import Config from "../../config";

export const loginRouter = Router();

loginRouter.get(
  "/login",
  parseRequest({
    query: z.object({
      code: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const { code } = req.query;

    if (!code) {
      return next(
        createError(401, "Authentication failed. Cannot find 'code'."),
      );
    }

    const oauthClient = new OauthClient();
    const githubAccessToken = await oauthClient.getToken(code);

    if (!githubAccessToken) {
      return next(
        createError(
          401,
          "Authentication failed. Cannot find 'githubAccessToken'.",
        ),
      );
    }

    const github = new Github(githubAccessToken);
    const githubData = await github.getUserData();

    if (!githubData) {
      return next(
        createError(401, "Authentication failed. Cannot find 'githubData'."),
      );
    }

    const userService = container.get<UserService>("UserService");

    const userData = await userService.login({
      username: githubData.login,
      userGithubUri: githubData.url,
      userImage: githubData.avatar_url,
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

export default loginRouter;

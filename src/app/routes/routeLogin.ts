import { Router } from "express";
import { z } from "zod";
import createError from "http-errors";

import Config from "../../@config";
import { container, TokenClient } from "../../@config/di.config";
import { parseRequest } from "../middlewares/parseRequest";
import { handleAsync } from "../utils/handleAsync";

import type { UserService } from "../../domains/UserService";
import type { GithubClient } from "../../infrastructure/GithubClient";

export const loginRouter = Router();

loginRouter.get(
  "/login",
  parseRequest({
    query: z.object({
      code: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const githubClient = container.get<GithubClient>("GithubClient");
    const userService = container.get<UserService>("UserService");
    const tokenClient = container.get<TokenClient>("JwtTokenClient");

    const { code } = req.query;

    if (!code) {
      return next(
        createError(401, "Authentication failed. Cannot find 'code'."),
      );
    }

    const githubAccessToken = await githubClient.getToken({ code });

    if (!githubAccessToken) {
      return next(
        createError(
          401,
          "Authentication failed. Cannot find 'githubAccessToken'.",
        ),
      );
    }

    const githubData = await githubClient.getUserData({
      accessToken: githubAccessToken,
    });

    if (!githubData) {
      return next(
        createError(401, "Authentication failed. Cannot find 'githubData'."),
      );
    }

    const userData = await userService.login({
      username: githubData.login,
      userGithubUri: githubData.url,
      userImage: githubData.avatar_url ?? "",
      githubAccessToken,
    });

    const accessToken = tokenClient.createToken({
      payload: {
        username: githubData.login,
        userGithubUri: githubData.url,
        userImage: githubData.avatar_url ?? "",
      },
      key: Config.JWT_SECRET,
      options: { expiresIn: "1d" },
    });

    const productionCookieOptions =
      Config.NODE_ENV === "production"
        ? {
            httpOnly: true,
            secure: true,
            domain: Config.ORIGIN_SERVER_URL,
          }
        : {};
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      ...productionCookieOptions,
    } as const;

    const { referer } = req.headers;

    return res
      .cookie("githubAccessToken", githubAccessToken, cookieOptions)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("userId", userData._id, cookieOptions)
      .redirect(referer ?? Config.CLIENT_URL);
  }),
);

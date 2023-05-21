import { Router } from "express";
import createError from "http-errors";
import { z } from "zod";

import { container } from "../../@config/di.config";
import { parseRequest } from "../middlewares/parseRequest";
import { verifyAccessToken } from "../middlewares/verifyAccessToken";
import { handleAsync } from "../utils/handleAsync";

import type { UserService } from "../../domains/UserService";
import type { UserRepository } from "../../domains/UserRepository";

export const usersRouter = Router();

usersRouter.use("/users", verifyAccessToken);

usersRouter.get(
  "/user",
  handleAsync(async (req, res) => {
    const userRepository = container.get<UserRepository>("UserRepository");

    const { userId } = req.cookies;

    if (!userId) {
      return createError(401, "Unauthorized User.");
    }

    const [user] = await userRepository.readDocument({
      documentId: userId,
    });

    return res.json({
      message: "ok",
      result: user,
    });
  }),
);

usersRouter.get(
  "/user/spaces",
  handleAsync(async (req, res, next) => {
    const userService = container.get<UserService>("UserService");

    const { githubAccessToken } = req.cookies;

    if (!githubAccessToken) {
      return next(
        createError(
          400,
          "The 'githubAccessToken' could not be found in the request header.",
        ),
      );
    }

    const spaces = await userService.getSpaces({
      githubAccessToken,
    });

    return res.json({
      message: "ok",
      result: spaces,
    });
  }),
);

usersRouter.get(
  "/user/spaces/:spaceId/repos",
  parseRequest({
    params: z.object({
      spaceId: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const userService = container.get<UserService>("UserService");

    const { githubAccessToken } = req.cookies;

    if (!githubAccessToken) {
      return next(
        createError(
          400,
          "The 'githubAccessToken' could not be found in the request header.",
        ),
      );
    }

    const { spaceId } = req.params;
    const repos = await userService.getSpaceRepos({
      githubAccessToken,
      spaceId,
    });

    return res.json({
      message: "ok",
      result: repos,
    });
  }),
);

usersRouter.get(
  "/users/projects",
  handleAsync(async (req, res, next) => {
    const userRepository = container.get<UserRepository>("UserRepository");

    const { userId } = req.cookies;

    if (!userId) {
      return next(createError(401, "Unauthorized User."));
    }

    const [user] = await userRepository.readDocument({
      documentId: userId,
    });

    return res.json({
      message: "ok",
      result: user?.projects ?? [],
    });
  }),
);

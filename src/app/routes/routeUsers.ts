import { Router } from "express";
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
  handleAsync(async (req, res) => {
    const userService = container.get<UserService>("UserService");

    const { githubAccessToken } = req.cookies;
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
  handleAsync(async (req, res) => {
    const userService = container.get<UserService>("UserService");

    const { githubAccessToken } = req.cookies;
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
  handleAsync(async (req, res) => {
    const userRepository = container.get<UserRepository>("UserRepository");

    const { userId } = req.cookies;
    const [user] = await userRepository.readDocument({
      documentId: userId,
    });

    return res.json({
      message: "ok",
      result: user?.projects ?? [],
    });
  }),
);

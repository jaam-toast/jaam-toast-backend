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
  "/users/:userId",
  parseRequest({
    params: z.object({
      userId: z.string().regex(/^[a-f\d]{24}$/i),
    }),
  }),
  handleAsync(async (req, res) => {
    const userRepository = container.get<UserRepository>("UserRepository");

    const { userId } = req.params;
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
  "/users/:userId/spaces",
  parseRequest({
    params: z.object({
      userId: z.string().regex(/^[a-f\d]{24}$/i),
    }),
    query: z.object({
      githubAccessToken: z.string(),
    }),
  }),
  handleAsync(async (req, res) => {
    const userService = container.get<UserService>("UserService");

    const { githubAccessToken } = req.query;
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
  "/users/:userId/spaces/:spaceId/repos",
  parseRequest({
    params: z.object({
      userId: z.string().regex(/^[a-f\d]{24}$/i),
      spaceId: z.string(),
    }),
    query: z.object({
      githubAccessToken: z.string(),
    }),
  }),
  handleAsync(async (req, res) => {
    const userService = container.get<UserService>("UserService");

    const { githubAccessToken } = req.query;
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
  "/users/:userId/projects",
  parseRequest({
    params: z.object({
      userId: z.string().regex(/^[a-f\d]{24}$/i),
    }),
  }),
  handleAsync(async (req, res) => {
    const userRepository = container.get<UserRepository>("UserRepository");

    const { userId } = req.params;
    const [user] = await userRepository.readDocument({
      documentId: userId,
    });

    return res.json({
      message: "ok",
      result: user?.projects ?? [],
    });
  }),
);

import { Router } from "express";
import { z } from "zod";

import { parseRequest } from "../middlewares/parseRequest";
import { verifyAccessToken } from "../middlewares/verifyAccessToken";
import { handleAsync } from "../utils/handleAsync";
import { container } from "../../config/di.config";

import type { UserService } from "../../domains/userService";

export const usersRouter = Router();

usersRouter.use("/users", verifyAccessToken);

usersRouter.get(
  "/users/:userId/orgs",
  parseRequest({
    params: z.object({
      userId: z.string().regex(/^[a-f\d]{24}$/i),
    }),
    query: z.object({
      githubAccessToken: z.string(),
    }),
  }),
  handleAsync(async (req, res) => {
    const { githubAccessToken } = req.query;

    const userService = container.get<UserService>("UserService");
    const orgsData = await userService.getUserGithubOrgs({
      githubAccessToken,
    });

    return res.json({
      message: "ok",
      result: orgsData,
    });
  }),
);

usersRouter.get(
  "/users/:userId/repos",
  parseRequest({
    params: z.object({
      userId: z.string().regex(/^[a-f\d]{24}$/i),
    }),
    query: z.object({
      githubAccessToken: z.string(),
    }),
  }),
  handleAsync(async (req, res) => {
    const { githubAccessToken } = req.query;

    const userService = container.get<UserService>("UserService");
    const sortedUserReposList = await userService.getUserGithubRepos({
      githubAccessToken,
    });

    return res.json({
      message: "ok",
      result: sortedUserReposList,
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
    const { userId } = req.params;

    const userService = container.get<UserService>("UserService");
    const userProjects = await userService.getUserProjects({ userId });

    return res.json({
      message: "ok",
      result: userProjects,
    });
  }),
);

usersRouter.get(
  "/users/:userId/orgs/:org/repos",
  parseRequest({
    params: z.object({
      userId: z.string().regex(/^[a-f\d]{24}$/i),
      org: z.string(),
    }),
    query: z.object({
      githubAccessToken: z.string(),
    }),
  }),
  handleAsync(async (req, res, next) => {
    const { githubAccessToken } = req.query;
    const { org } = req.params;

    const userService = container.get<UserService>("UserService");
    const organizationReposList = await userService.getUserGithubOrgsRepos({
      githubAccessToken,
      org,
    });

    return res.json({
      message: "ok",
      result: organizationReposList,
    });
  }),
);

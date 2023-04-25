import { Router } from "express";
import { z } from "zod";

import { parseRequest } from "../middlewares/parseRequest";
import { verifyAccessToken } from "../middlewares/verifyAccessToken";
import { asyncHandler } from "../utils/asyncHandler";
import { container } from "../../domains/@config/di.config";
import { UserService } from "../../domains/userService";

const route = Router();

const usersRouter = (app: Router) => {
  app.use("/users", verifyAccessToken, route);

  route.get(
    "/:userId/orgs",
    parseRequest({
      params: z.object({
        userId: z.string().regex(/^[a-f\d]{24}$/i),
      }),
      query: z.object({
        githubAccessToken: z.string(),
      }),
    }),
    asyncHandler(async (req, res) => {
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

  route.get(
    "/:userId/repos",
    parseRequest({
      params: z.object({
        userId: z.string().regex(/^[a-f\d]{24}$/i),
      }),
      query: z.object({
        githubAccessToken: z.string(),
      }),
    }),
    asyncHandler(async (req, res) => {
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

  route.get(
    "/:userId/projects",
    parseRequest({
      params: z.object({
        userId: z.string().regex(/^[a-f\d]{24}$/i),
      }),
    }),
    asyncHandler(async (req, res) => {
      const { userId } = req.params;

      const userService = container.get<UserService>("UserService");
      const userProjects = await userService.getUserProjects({ userId });

      return res.json({
        message: "ok",
        result: userProjects,
      });
    }),
  );

  route.get(
    "/:userId/orgs/:org/repos",
    parseRequest({
      params: z.object({
        userId: z.string().regex(/^[a-f\d]{24}$/i),
        org: z.string(),
      }),
      query: z.object({
        githubAccessToken: z.string(),
      }),
    }),
    asyncHandler(async (req, res, next) => {
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
};

export default usersRouter;

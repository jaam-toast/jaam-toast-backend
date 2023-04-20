import { Router } from "express";
import Joi from "joi";

import { verifyAccessToken } from "../middlewares/verifyAccessToken";
import { validateRequest } from "../middlewares/validateRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { container } from "../../domains/@config/di.config";
import { UserService } from "../../domains/userService";

const route = Router();

const usersRouter = (app: Router) => {
  app.use("/users", verifyAccessToken, route);

  route.get(
    "/:user_id/orgs",
    validateRequest(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params",
    ),
    validateRequest(
      Joi.object({
        githubAccessToken: Joi.string().required(),
      }),
      "query",
    ),
    asyncHandler(async (req, res, next) => {
      const { githubAccessToken } = req.query;

      const userService = container.get<UserService>("UserService");
      const orgsData = await userService.getUserGithubOrgs({
        githubAccessToken: githubAccessToken as string,
      });

      return res.json({
        message: "ok",
        result: orgsData,
      });
    }),
  );

  route.get(
    "/:user_id/repos",
    validateRequest(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params",
    ),
    validateRequest(
      Joi.object({
        githubAccessToken: Joi.string().required(),
      }),
      "query",
    ),
    asyncHandler(async (req, res) => {
      const { githubAccessToken } = req.query;

      const userService = container.get<UserService>("UserService");
      const sortedUserReposList = await userService.getUserGithubRepos({
        githubAccessToken: githubAccessToken as string,
      });

      return res.json({
        message: "ok",
        result: sortedUserReposList,
      });
    }),
  );

  route.get(
    "/:user_id/projects",
    validateRequest(
      Joi.object({
        user_id: Joi.string()
          .regex(/^[a-f\d]{24}$/i)
          .required(),
      }),
      "params",
    ),
    asyncHandler(async (req, res) => {
      const { user_id: userId } = req.params;

      const userService = container.get<UserService>("UserService");
      const userProjects = await userService.getUserProjects({ userId });

      return res.json({
        message: "ok",
        result: userProjects,
      });
    }),
  );

  route.get(
    "/:user_id/orgs/:org/repos",
    validateRequest(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
        org: Joi.string().required(),
      }),
      "params",
    ),
    validateRequest(
      Joi.object({
        githubAccessToken: Joi.string().required(),
      }),
      "query",
    ),
    asyncHandler(async (req, res, next) => {
      const { githubAccessToken } = req.query;
      const { org } = req.params;

      const userService = container.get<UserService>("UserService");
      const organizationReposList = await userService.getUserGithubOrgsRepos({
        githubAccessToken: githubAccessToken as string,
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

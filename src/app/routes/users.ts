import { Router } from "express";
import createError from "http-errors";
import Joi from "joi";

// import GithubClient from "@src/__temp/services/GithubClient";
import { Github as GithubClient } from "@src/infrastructure/github";
import { UserRepository } from "@src/domains/repositories/userRepository";
import verifyToken from "@src/app/middlewares/verifyToken";
import validateSchema from "@src/app/middlewares/validateSchema";
import { asyncHandler } from "@src/app/utils/asyncHandler";

const route = Router();

const usersRouter = (app: Router) => {
  app.use("/users", verifyToken, route);

  route.get(
    "/:user_id/orgs",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params",
    ),
    asyncHandler(async (req, res, next) => {
      const { githubAccessToken } = req.query;

      if (!githubAccessToken) {
        return next(createError(400));
      }

      const githubClient = new GithubClient(githubAccessToken as string);
      const organizations = await githubClient.getOrgs();
      const orgsData = organizations.map(org => ({
        spaceName: org.login,
        spaceUrl: org.repos_url,
        spaceImage: org.avatar_url,
      }));

      return res.json({
        message: "ok",
        result: orgsData,
      });
    }),
  );

  route.get(
    "/:user_id/repos",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params",
    ),
    asyncHandler(async (req, res, next) => {
      const { githubAccessToken } = req.query;

      if (!githubAccessToken) {
        return next(createError(400));
      }

      const githubClient = new GithubClient(githubAccessToken as string);
      const publicRepos = await githubClient.getRepos("public");
      const privateRepos = await githubClient.getRepos("private");

      if (!publicRepos || !privateRepos) {
        return next(createError(401));
      }

      const repositories = [...publicRepos, ...privateRepos];

      const userReposList = repositories.map(repo => {
        const repoData = {
          repoName: repo.full_name,
          repoCloneUrl: repo.clone_url,
          repoUpdatedAt: repo.updated_at,
        };

        return repoData;
      });

      const sortedUserReposList = userReposList.sort(
        (a, b) =>
          new Date(`${b.repoUpdatedAt}`).valueOf() -
          new Date(`${a.repoUpdatedAt}`).valueOf(),
      );

      return res.json({
        message: "ok",
        result: sortedUserReposList,
      });
    }),
  );

  route.get(
    "/:user_id/projects",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params",
    ),
    asyncHandler(async (req, res, next) => {
      const { user_id } = req.params;

      if (!user_id) {
        return next(createError(401, "Cannot find environment data 'user_id'"));
      }

      const userProjects = await UserRepository.findByIdAndGetProjects(user_id);

      return res.json({
        message: "ok",
        result: userProjects,
      });
    }),
  );

  route.get(
    "/:user_id/orgs/:org/repos",
    validateSchema(
      Joi.object({
        user_id: Joi.string().regex(/^[a-f\d]{24}$/i),
      }),
      "params[user_id]",
    ),
    asyncHandler(async (req, res, next) => {
      const { githubAccessToken } = req.query;
      const { org } = req.params;

      if (!githubAccessToken || !org) {
        return next(createError(400));
      }

      const githubClient = new GithubClient(githubAccessToken as string);
      const organizationRepos = await githubClient.getOrgRepos(org);

      if (!organizationRepos) {
        return next(createError(401));
      }

      const organizationReposList = organizationRepos.map(repo => ({
        repoName: repo.full_name,
        repoCloneUrl: repo.clone_url,
        repoUpdatedAt: repo.updated_at,
      }));

      return res.json({
        message: "ok",
        result: organizationReposList,
      });
    }),
  );
};

export default usersRouter;

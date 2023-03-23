import createError from "http-errors";

import catchAsync from "@src/controllers/utils/asyncHandler";
import UserModel from "@src/services/DBService/user";
import GithubClient from "@src/services/GithubClient";

export const getOrganizations = catchAsync(async (req, res, next) => {
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
    result: "ok",
    data: orgsData,
  });
});

export const getUserRepos = catchAsync(async (req, res, next) => {
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
    result: "ok",
    data: sortedUserReposList,
  });
});

export const getUserProjects = catchAsync(async (req, res, next) => {
  const { user_id } = req.params;

  if (!user_id) {
    return next(createError(401, "Cannot find environment data 'user_id'"));
  }

  const userProjects = await UserModel.findByIdAndGetProjects(user_id);

  return res.json({
    result: "ok",
    data: userProjects,
  });
});

export const getOrganizationRepos = catchAsync(async (req, res, next) => {
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
    result: "ok",
    data: organizationReposList,
  });
});

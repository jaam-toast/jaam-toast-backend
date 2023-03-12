import createError from "http-errors";

import catchAsync from "../utils/asyncHandler";
import { getRepos, getOrgs, getOrgRepos } from "../services/GithubService/client";

export const getOrganizations = catchAsync(async (req, res, next) => {
  const { githubAccessToken } = req.query;

  if (!githubAccessToken) {
    return next(createError(400));
  }

  const organizations = await getOrgs(githubAccessToken as string);

  const orgsData = organizations.map(org => {
    const orgData = {
      spaceName: org.login,
      spaceUrl: org.repos_url,
      spaceImage: org.avatar_url,
    };

    return orgData;
  });

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

  const publicRepos = await getRepos(githubAccessToken as string, "public");
  const privateRepos = await getRepos(githubAccessToken as string, "private");

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

export const getOrganizationRepos = catchAsync(async (req, res, next) => {
  const { githubAccessToken } = req.query;
  const { org } = req.params;

  if (!githubAccessToken || !org) {
    return next(createError(400));
  }

  const organizationRepos = await getOrgRepos(githubAccessToken as string, org);

  if (!organizationRepos) {
    return next(createError(401));
  }

  const organizationReposList = organizationRepos.map(repo => {
    const repoData = {
      repoName: repo.full_name,
      repoCloneUrl: repo.clone_url,
      repoUpdatedAt: repo.updated_at,
    };

    return repoData;
  });

  return res.json({
    result: "ok",
    data: organizationReposList,
  });
});

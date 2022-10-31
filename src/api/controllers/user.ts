import createError from "http-errors";

import {
  getOrgs,
  getPrivateRepos,
  getPublicRepos,
} from "../github/client";

import catchAsync from "../../utils/asyncHandler";

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

  const publicRepos = await getPublicRepos(githubAccessToken as string);
  const privateRepos = await getPrivateRepos(githubAccessToken as string);

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


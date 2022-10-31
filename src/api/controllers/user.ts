import createError from "http-errors";

import {
  getOrgs,
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

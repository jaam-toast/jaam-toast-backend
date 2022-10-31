import createError from "http-errors";

import catchAsync from "../../utils/asyncHandler";
import { getGithubToken } from "../github/oauth";
import { getUserData } from "../github/client";

const verifyGithubCode = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return next(createError(401));
  }

  const githubAccessToken = await getGithubToken(code as string);

  if (!githubAccessToken) {
    return next(createError(401));
  }

  const githubData = await getUserData(githubAccessToken);

  if (!githubData) {
    return next(createError(401));
  }

  const verifiedUserData = {
    username: githubData.login,
    userGithubUri: githubData.url,
    userImage: githubData.avatar_url,
    githubAccessToken,
  };

  req.user = verifiedUserData;

  next();
});

export default verifyGithubCode;

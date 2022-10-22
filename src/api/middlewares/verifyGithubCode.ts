import createError from "http-errors";

import catchAsync from "../../utils/asyncHandler";
import { getGithubToken } from "../github/oauth";
import { getUserData } from "../github/client";

const verifyGithubCode = catchAsync(async (req, res, next) => {
  const { code }: { code: string } = req.body;

  if (!code) {
    return next(createError(401));
  }

  const accessToken = await getGithubToken(code);

  if (!accessToken) {
    return next(createError(401));
  }

  const githubData = await getUserData(accessToken);

  if (!githubData) {
    return next(createError(401));
  }

  const verifiedUserData = {
    username: githubData.login,
    userGithubUri: githubData.url,
    userImage: githubData.avatar_url,
  };

  req.user = verifiedUserData;

  next();
});

export default verifyGithubCode;

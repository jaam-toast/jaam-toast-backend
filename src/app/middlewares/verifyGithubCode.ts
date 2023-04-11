import createError from "http-errors";

import OauthClient from "../../__temp/services/OauthClient";
import { asyncHandler as catchAsync } from "@src/app/utils/asyncHandler";
import { GithubService } from "@src/infrastructure/githubService";

const verifyGithubCode = catchAsync(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(createError(401, "Authentication failed. Cannot find 'code'."));
  }

  const oauthClient = new OauthClient();
  const githubAccessToken = await oauthClient.getToken(code as string);

  if (!githubAccessToken) {
    return next(
      createError(
        401,
        "Authentication failed. Cannot find 'githubAccessToken'.",
      ),
    );
  }

  const github = new GithubService(githubAccessToken);
  const githubData = await github.getUserData();

  if (!githubData) {
    return next(
      createError(401, "Authentication failed. Cannot find 'githubData'."),
    );
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

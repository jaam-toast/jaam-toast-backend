import createError from "http-errors";

import catchAsync from "../controllers/utils/asyncHandler";
import OauthClient from "../services/OauthClient";
import GithubClient from "../services/GithubClient";

const verifyGithubCode = catchAsync(async (req, res, next) => {
  const { code } = req.body;

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

  const githubClient = new GithubClient(githubAccessToken);
  const githubData = await githubClient.getUserData();

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

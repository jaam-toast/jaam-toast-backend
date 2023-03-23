import createError from "http-errors";
import jwt from "jsonwebtoken";

import Config from "@src/config";
import catchAsync from "@src/controllers/utils/asyncHandler";
import DB from "@src/services/DBService";

export const login = catchAsync(async (req, res, next) => {
  const { username, userGithubUri, userImage, githubAccessToken } = req.user;

  if (!username || !userGithubUri) {
    return next(createError(401));
  }

  let userData = await DB.User.findOne({ userGithubUri });

  if (!userData) {
    userData = await DB.User.create({
      username,
      userGithubUri,
      userImage,
      githubAccessToken,
    });
  }

  const userPayload = {
    username: userData?.username,
    userGithubUri: userData?.userGithubUri,
    userImage: userData?.userImage,
  };

  const accessToken = jwt.sign(userPayload, Config.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.json({
    message: "ok",
    result: {
      _id: userData?._id,
      username: userData?.username,
      userGithubUri: userData?.userGithubUri,
      userImage: userData?.userImage,
    },
    githubAccessToken,
    accessToken,
  });
});

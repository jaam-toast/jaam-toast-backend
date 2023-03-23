import createError from "http-errors";
import jwt from "jsonwebtoken";

import Config from "@src/config";
import catchAsync from "@src/controllers/utils/asyncHandler";
import UserModel from "@src/services/DBService/user";

export const login = catchAsync(async (req, res, next) => {
  const { username, userGithubUri, userImage, githubAccessToken } = req.user;

  if (!username || !userGithubUri) {
    return next(createError(401));
  }

  let userData = await UserModel.findOne({ userGithubUri });

  if (!userData) {
    userData = await UserModel.create({
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

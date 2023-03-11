import createError from "http-errors";
import jwt from "jsonwebtoken";

import Config from "../config";
import { User } from "../models/User";

import catchAsync from "../utils/asyncHandler";

export const login = catchAsync(async (req, res, next) => {
  const { username, userGithubUri, userImage, githubAccessToken } = req.user;

  if (!username || !userGithubUri) {
    return next(createError(401));
  }

  let userData = await User.findOne({ userGithubUri });

  if (!userData) {
    userData = await User.create({
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
    result: "ok",
    data: {
      _id: userData?._id,
      username: userData?.username,
      userGithubUri: userData?.userGithubUri,
      userImage: userData?.userImage,
    },
    githubAccessToken,
    accessToken,
  });
});

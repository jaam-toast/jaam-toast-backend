import { RequestHandler } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";

import { User } from "../../models/User";

import catchAsync from "../../utils/asyncHandler";
import config from "../../config";

export const login: RequestHandler = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return next(createError(401));
  }

  let userData = await User.findOne({ email });

  if (!userData) {
    userData = await User.create({
      name,
      email,
    });
  }

  const userPayload = {
    name: userData.name,
    email: userData.email,
  };

  const accessToken = jwt.sign(userPayload, config.JWT_SECRET!, {
    expiresIn: "1d",
  });

  return res.json({
    result: "ok",
    data: { userData },
    accessToken,
  });
});

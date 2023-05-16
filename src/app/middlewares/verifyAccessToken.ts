import createError from "http-errors";

import { container } from "../../@config/di.config";
import Config from "../../@config";

import type { TokenClient } from "../../@config/di.config";
import type { RequestHandler } from "express";

export const verifyAccessToken: RequestHandler = (req, res, next) => {
  const tokenClient = container.get<TokenClient>("TokenClient");

  const { accessToken } = req.cookies;
  const verifiedUserData = tokenClient.validateToken({
    token: accessToken,
    key: Config.JWT_SECRET,
  });

  if (!verifiedUserData) {
    return next(
      createError(
        401,
        "Authentication failed because the access token does not match.",
      ),
    );
  }

  next();
};

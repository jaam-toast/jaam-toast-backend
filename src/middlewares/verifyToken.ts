import createError from "http-errors";
import jwt from "jsonwebtoken";
import { RequestHandler } from "express";

import Config from "@src/config";

import { User } from "@src/types/db";

const verifyToken: RequestHandler = (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return next(
      createError(
        401,
        "Authentication failed because the authorization header could not be found.",
      ),
    );
  }

  if (authToken.split(" ")[0] !== "Bearer") {
    return next(
      createError(
        401,
        "Authentication failed because the authorization header did not start with 'Bearer'.",
      ),
    );
  }

  const accessToken = authToken.split(" ")[1];

  const getVerifiedUserData = (userAccessToken: string) => {
    try {
      const decodedUserData = jwt.verify(userAccessToken, Config.JWT_SECRET);

      return decodedUserData;
    } catch (error) {
      return null;
    }
  };

  const verifiedUserData = getVerifiedUserData(accessToken);

  if (!verifiedUserData) {
    return next(
      createError(
        401,
        "Authentication failed because the access token does not match.",
      ),
    );
  }

  req.user = verifiedUserData as User;

  next();
};

export default verifyToken;

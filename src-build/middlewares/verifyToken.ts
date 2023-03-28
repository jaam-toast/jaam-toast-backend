import createError from "http-errors";
import jwt from "jsonwebtoken";

import Config from "../config";

import type { RequestHandler } from "express";

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

  const getVerifiedData = (token: string) => {
    try {
      const decodedUserData = jwt.verify(token, Config.JWT_SECRET);

      return decodedUserData;
    } catch (error) {
      return null;
    }
  };

  const verifiedUserData = getVerifiedData(accessToken);

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

export default verifyToken;

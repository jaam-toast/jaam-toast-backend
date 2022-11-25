import { RequestHandler } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";

import Config from "../../config";

import { UserType } from "../../types/custom";

const verifyToken: RequestHandler = (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return next(createError(401));
  }

  if (authToken.split(" ")[0] !== "Bearer") {
    return next(createError(401));
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
    return next(createError(401));
  }

  req.user = verifiedUserData as UserType;

  next();
};

export default verifyToken;

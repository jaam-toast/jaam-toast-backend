import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";

import config from "../../config";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
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
      const decodedUserData = jwt.verify(userAccessToken, config.JWT_SECRET!);

      return decodedUserData;
    } catch (error) {
      return null;
    }
  };

  const verifiedUserData = getVerifiedUserData(accessToken);

  if (!verifiedUserData) {
    return next(createError(401));
  }

  req.user = verifiedUserData;

  next();
};

export default verifyToken;

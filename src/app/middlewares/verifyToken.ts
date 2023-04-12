import type { RequestHandler } from "express";
import createError from "http-errors";

import type { User } from "../../types/db";
import { Jwt } from "../../infrastructure/jwt";

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
      const decodedUserData = Jwt.verify({ token: userAccessToken });

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

  req.app.locals = verifiedUserData as User;

  next();
};

export default verifyToken;

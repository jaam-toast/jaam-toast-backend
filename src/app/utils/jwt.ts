import jwt from "jsonwebtoken";

import Config from "@src/config";

export const signJwt = (id: string) => {
  const token = jwt.sign({ id }, Config.JWT_SECRET, {
    expiresIn: "1h",
  });

  return token;
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, Config.JWT_SECRET);
};

import jwt from "jsonwebtoken";

import Config from "./@config";

type Options = {
  payload: string | object | Buffer;
  token: string;
  options: jwt.SignOptions;
};

export class Jwt {
  static sign({ payload, options }: Pick<Options, "payload" | "options">) {
    const token = jwt.sign(payload, Config.JWT_SECRET, {
      ...options,
      algorithm: "RS256",
    });

    return token;
  }

  static verify({ token }: Pick<Options, "token">) {
    return jwt.verify(token, Config.JWT_SECRET);
  }
}

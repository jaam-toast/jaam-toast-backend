import jwt from "jsonwebtoken";

import Config from "../../@config";

export function createToken({ payload }: { payload: string }) {
  return jwt.sign(payload, Config.JWT_SECRET);
}

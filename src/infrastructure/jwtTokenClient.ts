import { injectable } from "inversify";
import jwt from "jsonwebtoken";

import type { Payload, TokenClient } from "src/config/di.config";

@injectable()
export class JwtTokenClient implements TokenClient {
  createToken({
    payload,
    key,
    options = {},
  }: {
    payload: Payload;
    key: string;
    options?: { expiresIn?: string | number };
  }): string {
    return jwt.sign(payload, key, options);
  }

  validateToken({
    token,
    key,
  }: {
    token: string;
    key: string;
  }): Payload | null {
    try {
      return jwt.verify(token, key) as Payload;
    } catch {
      return null;
    }
  }
}

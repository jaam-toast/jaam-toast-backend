import { injectable } from "inversify";
import jwt from "jsonwebtoken";

export type Payload = Record<
  string,
  | string
  | number
  | boolean
  | null
  | Array<string | number | boolean | null>
  | Record<
      string,
      string | number | boolean | null | Array<string | number | boolean | null>
    >
>;

export interface TokenClient {
  createToken: ({
    payload,
    key,
    options,
  }: {
    payload: Payload;
    key: string;
    options?: { expiresIn?: string | number };
  }) => string;

  validateToken: ({
    token,
    key,
  }: {
    token: string;
    key: string;
  }) => Payload | null;
}

@injectable()
export class jwtTokenClient implements TokenClient {
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

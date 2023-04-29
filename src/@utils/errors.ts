import { BaseError } from "./BaseError";

export type ErrorName =
  | "ValidateError"
  | "ForbiddenError"
  | "NotFoundError"
  | "UnknownError";

export class ValidateError extends BaseError<"ValidateError"> {
  constructor(message: string = "", error?: unknown) {
    super({ message, error, name: "ValidateError" });
  }
}

export class ForbiddenError extends BaseError<"ForbiddenError"> {
  constructor(message: string = "", error?: unknown) {
    super({ message, error, name: "ForbiddenError" });
  }
}

export class NotFoundError extends BaseError<"NotFoundError"> {
  constructor(message: string = "", error?: unknown) {
    super({ message, error, name: "NotFoundError" });
  }
}

export class UnknownError extends BaseError<"UnknownError"> {
  constructor(message: string = "", error?: unknown) {
    super({ message, error, name: "UnknownError" });
  }
}

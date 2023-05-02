import morgan from "morgan";
import * as log from "../../@utils/log";

import type { StreamOptions } from "morgan";

const stream: StreamOptions = {
  write: message => log.debug(message),
};

const skip = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return !isDevelopment;
};

export const logRequest = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip },
);

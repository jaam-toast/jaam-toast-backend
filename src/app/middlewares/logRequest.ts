import morgan from "morgan";
import { Logger as log } from "../../utils/Logger";

import type { StreamOptions } from "morgan";

const stream: StreamOptions = {
  write: message => log.request(message),
};

const skip = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return !isDevelopment;
};

export const logRequest = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip },
);

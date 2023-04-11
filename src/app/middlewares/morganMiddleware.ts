import morgan from "morgan";
import { Logger as log } from "@src/common/Logger";

import type { StreamOptions } from "morgan";

const stream: StreamOptions = {
  write: message => log.request(message),
};

const skip = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return !isDevelopment;
};

const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip },
);

export default requestLogger;

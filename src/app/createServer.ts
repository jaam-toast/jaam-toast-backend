import http from "http";

import Config from "@src/config";
import log from "@src/services/Logger";

import type { Express } from "express";
import type { Server } from "http";
import type { AddressInfo } from "net";

export const createServer = async (app: Express): Promise<Server> => {
  const port = parseInt(Config.MAIN_SERVER_PORT || "8000", 10);

  app.set("port", port);

  const server = http.createServer(app);

  server.listen(port);
  server.on("listening", () => {
    const addr = server.address() as string | AddressInfo;
    const bind =
      typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;

    log.debug(`🟢 Listening on ${bind}`);
    log.debug(`🟢 Server is listening on ${bind}`);
    log.debug("🌲 Express loaded!");
  });
  server.on("error", (error: { syscall: string; code: string }) => {
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
      case "EACCES":
        log.serverError(`❌ ${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        log.serverError(`❌ ${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  return server;
};

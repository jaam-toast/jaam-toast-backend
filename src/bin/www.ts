/**
 * Module dependencies.
 */
import Debug from "debug";
import http from "http";
import { AddressInfo } from "net";
import SocketSingleton, { buildingLogSocket } from "../deploy/socket";

import app from "../app";

import Config from "../config";
import Logger from "../loaders/logger";
import { createGeneralLogDebug } from "../utils/createDebug";

const debug = Debug("jaam-toast-backend:server");
const customDebug = createGeneralLogDebug(Config.CLIENT_OPTIONS.debug);

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "8000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
export const socketIO = new SocketSingleton(server);

buildingLogSocket();
customDebug(
  `Socket instance for building log is initiated - SocketSingleton Class`,
);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: { syscall: string; code: any }) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address() as string | AddressInfo;
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);

  Logger.info(`🟢 Server is listening on ${bind}`);
}

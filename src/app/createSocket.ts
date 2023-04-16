import { Server } from "http";
import { Socket } from "socket.io";

import { Logger as log } from "../util/Logger";
import { BUILD_MESSAGE } from "../config/constants";
import { SocketSingleton } from "../infrastructure/socket";

type Options = {
  server: Server;
  clientOrigin: string;
};

export const createSocket = async ({
  server,
  clientOrigin,
}: Options): Promise<void> => {
  const socket = new SocketSingleton({
    server,
    clientOrigin,
  });
  const socketInstance = socket.getInstance();

  log.debug("🚀 A new socket instance is created");

  if (!socketInstance) {
    log.serverError("❌ Socket creation failed.");

    throw Error("Socket creation failed.");
  }

  socketInstance.on("connection", (socket: Socket) => {
    socket.on("connection", () => {
      log.debug(
        "Socket is connected in order to send back to client the newly created deployment building log",
      );
    });

    socket.on("get-building-log", repoName => {
      log.debug(`Getting ready for sending a building log for ${repoName}`);

      log.subscribe((message: string) => {
        if (message.includes(BUILD_MESSAGE.CREATE.COMPLETE)) {
          socket.emit("build-complete", message);
        }

        if (
          message.includes(BUILD_MESSAGE.CREATE_ERROR.FAIL_PROJECT_CREATION)
        ) {
          socket.emit("build-error", message);
        }

        socket.emit("new-building-log", message);
      });
    });
  });
};

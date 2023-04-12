import { Server } from "http";
import { Socket } from "socket.io";

import { Logger as log } from "../common/Logger";
import { BUILD_COMPLETE_MESSAGE } from "../common/constants";
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
        if (message === BUILD_COMPLETE_MESSAGE) {
          socket.emit("build-complete", message);
        }

        socket.emit("new-building-log", message);
      });
    });
  });
};

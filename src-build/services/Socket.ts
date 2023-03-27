import { Server } from "http";
import { Server as socketServer, Socket } from "socket.io";

import Config from "../config";
import log from "./Logger";

import type { DefaultEventsMap } from "socket.io/dist/typed-events";

class SocketSingleton extends socketServer {
  private static instance: socketServer<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  > | null = null;

  constructor(server: Server) {
    super();

    if (SocketSingleton.instance) {
      log.serverError("An attempt was made to create more than one socket.");
      throw new Error("You can only create one instance!");
    }

    SocketSingleton.instance = new socketServer(server, {
      cors: {
        origin: Config.CLIENT_URL,
        methods: ["GET", "POST"],
      },
    });

    log.debug("🚀 A new socket instance is created");
  }

  init() {
    if (!SocketSingleton.instance) {
      return;
    }

    SocketSingleton.instance.on("connection", (socket: Socket) => {
      socket.on("connection", () => {
        log.debug(
          "Socket is connected in order to send back to client the newly created deployment building log",
        );
      });

      socket.on("get-building-log", repoName => {
        log.debug(`Getting ready for sending a building log for ${repoName}`);

        log.subscribe((message: string) => {
          if (message === "A new deployment's data is saved successfully!") {
            socket.emit("deployment-complete", message);
          }

          socket.emit("new-building-log", message);
        });
      });
    });
  }
}

export default SocketSingleton;

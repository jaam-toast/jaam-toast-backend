import { Server } from "http";
import { Server as socketServer, Socket } from "socket.io";

import log from "./Logger";

import { DefaultEventsMap } from "socket.io/dist/typed-events";

import Config from "../config";

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
      throw new Error("You can only create one instance!");
    }

    SocketSingleton.instance = new socketServer(server, {
      cors: {
        origin: Config.CLIENT_URL,
        methods: ["GET", "POST"],
      },
    });

    process.stderr.write("A new socket instance is created");
  }

  static init() {
    if (!this.instance) {
      return;
    }

    this.instance.on("connection", (socket: Socket) => {
      socket.on("connection", () => {
        log.debug(
          "Socket is connected in order to send back to client the newly created deployment building log",
        );
      });

      socket.on("get-building-log", repoName => {
        log.debug(`Getting ready for sending a building log for ${repoName}`);

        log.subscribe((message: string) => {
          socket.emit("new-building-log", message);
        });
      });
    });
  }
}

export default SocketSingleton;

import { Server } from "http";
import { Server as socketServer } from "socket.io";

import { DefaultEventsMap } from "socket.io/dist/typed-events";

import Config from "../../../config";

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

  getInstance() {
    return SocketSingleton.instance as socketServer;
  }
}

export default SocketSingleton;

import { Server } from "http";
import { Server as socketServer } from "socket.io";

import { Logger as log } from "../util/Logger";

type Options = {
  server: Server;
  clientOrigin: string;
};

export class SocketSingleton extends socketServer {
  private static instance: socketServer | null = null;

  constructor({ server, clientOrigin }: Options) {
    super();

    if (SocketSingleton.instance) {
      log.serverError("An attempt was made to create more than one socket.");

      throw new Error("You can only create one instance!");
    }

    SocketSingleton.instance = new socketServer(server, {
      cors: {
        origin: clientOrigin,
        methods: ["GET", "POST"],
      },
    });
  }

  getInstance() {
    return SocketSingleton.instance;
  }
}

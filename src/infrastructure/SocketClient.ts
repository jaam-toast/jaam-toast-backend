import { injectable } from "inversify";
import { Server as SocketServer } from "socket.io";

import type { Server } from "http";
import Config from "../@config";

@injectable()
export class SocketClient {
  private static instance: SocketServer | null = null;

  public connect({ server }: { server: Server }) {
    SocketClient.instance = new SocketServer(server, {
      cors: {
        origin:
          Config.NODE_ENV === "production"
            ? [
                Config.CLIENT_URL,
                Config.PRODUCTION_CLIENT_URL,
                Config.ORIGIN_SERVER_URL,
              ]
            : Config.CLIENT_LOCAL_URL,
        credentials: true,
        methods: ["GET", "POST"],
      },
    });
  }

  public get server() {
    if (!SocketClient.instance) {
      throw new Error("An attempt was made to create more than one socket.");
    }

    return SocketClient.instance;
  }
}

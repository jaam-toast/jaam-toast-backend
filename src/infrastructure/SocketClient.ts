import { injectable } from "inversify";
import { Server as SocketServer } from "socket.io";

import type { Server } from "http";

@injectable()
export class SocketClient {
  private static instance: SocketServer | null = null;

  public connect({
    server,
    clientOrigin,
  }: {
    server: Server;
    clientOrigin: string;
  }) {
    SocketClient.instance = new SocketServer(server, {
      cors: {
        origin: clientOrigin,
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

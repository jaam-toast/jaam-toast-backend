import { Server } from "http";

import SocketSingleton from "../services/Socket";

const sockerLoader = async (server: Server): Promise<void> => {
  const socket = new SocketSingleton(server);

  socket.init();
};

export default sockerLoader;

import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";

let socket;

export function createSocket(token) {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
  });

  return socket;
}

export function getSocket() {
  return socket;
}


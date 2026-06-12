import { io } from "socket.io-client";
export const socket = io("https://dsabattle.onrender.com", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

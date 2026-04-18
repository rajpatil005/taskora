import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("NEXT_PUBLIC_API_URL is missing");
}

export const getSocket = (token: string): Socket | null => {
  if (!token) return null;

  // If token changes → reset socket
  if (socket && currentToken !== token) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }

  // Create socket only once per token
  if (!socket) {
    socket = io(API_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    });

    currentToken = token;
  }

  return socket;
};

// OPTIONAL (but recommended)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();

    // 🔥 IMPORTANT: remove all event listeners
    socket.removeAllListeners();

    socket = null;
    currentToken = null;
  }
};

import jwt from "jsonwebtoken";
import Message from "../models/Message.js";

export const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // auth user from token
    const token = socket.handshake.auth?.token;

    let userId = null;

    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded._id;

        //  JOIN USER ROOM
        if (userId) {
          socket.join(String(userId));
        }
        console.log("User joined room:", userId);
      }
    } catch (err) {
      console.log("Socket auth failed:", err.message);
    }

    // join task chat room
    socket.on("joinTask", (taskId) => {
      socket.join(taskId);
      console.log("Joined task room:", taskId);
    });

    // leave task room
    socket.on("leaveTask", (taskId) => {
      socket.leave(taskId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

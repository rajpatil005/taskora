import Message from "../models/Message.js";

export const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ✅ JOIN ROOM
    socket.on("joinTask", (taskId) => {
      socket.join(taskId);
      console.log("Joined room:", taskId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

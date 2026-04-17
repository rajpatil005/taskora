import express from "express";
import {
  getTaskMessages,
  getConversations,
  sendMessage,
  markAsRead,
  getUnreadCount,
} from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.use(protectRoute);

router.get("/conversations", getConversations);
router.get("/task/:taskId", getTaskMessages);
router.post("/", sendMessage);
router.put("/read/:taskId", markAsRead);
router.get("/unread-count", getUnreadCount);

export default router;

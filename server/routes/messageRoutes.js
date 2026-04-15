import express from "express";
import {
  getTaskMessages,
  getConversations,
  sendMessage,
  markAsRead,
} from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.use(protectRoute);

router.get("/conversations", getConversations);
router.get("/task/:taskId", getTaskMessages);
router.post("/", sendMessage);
router.put("/read/:taskId", markAsRead);

export default router;

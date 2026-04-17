import express from "express";

const router = express.Router();

import {
  getNotifications,
  markAsRead,
} from "../controllers/notificationController.js";
import { protectRoute } from "../middleware/auth.js";

// GET notifications
router.get("/", protectRoute, getNotifications);

// MARK AS READ
router.patch("/:id/read", protectRoute, markAsRead);

export default router;

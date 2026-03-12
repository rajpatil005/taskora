import express from 'express';
import {
  getTaskMessages,
  getConversations
} from '../controllers/messageController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

router.use(protectRoute);

router.get('/conversations', getConversations);
router.get('/task/:taskId', getTaskMessages);

export default router;

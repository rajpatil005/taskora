import express from 'express';
import {
  initiatePayment,
  verifyPayment,
  handleWebhook
} from '../controllers/paymentController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', protectRoute, initiatePayment);
router.post('/verify', protectRoute, verifyPayment);
router.post('/webhook', handleWebhook);

export default router;

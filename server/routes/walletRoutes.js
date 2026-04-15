import express from 'express';
import { getWallet, getWalletHistory, addFunds } from '../controllers/walletController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

router.use(protectRoute);

router.get('/', getWallet);
router.get('/history', getWalletHistory);
router.post('/add-funds', addFunds);

export default router;

import express from 'express';
import {
  updateProfile,
  getUserProfile,
  changePassword
} from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', protectRoute, updateProfile);
router.post('/password/change', protectRoute, changePassword);
router.get('/:userId', getUserProfile);

export default router;

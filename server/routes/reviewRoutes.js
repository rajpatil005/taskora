import express from 'express';
import {
  createReview,
  getTaskReviews,
  getUserReviews
} from '../controllers/reviewController.js';
import { protectRoute } from '../middleware/auth.js';
import { reviewValidation, taskIdValidation } from '../middleware/taskValidation.js';

const router = express.Router();

router.post('/:id', protectRoute, reviewValidation, taskIdValidation, createReview);
router.get('/task/:id', taskIdValidation, getTaskReviews);
router.get('/user/:userId', getUserReviews);

export default router;

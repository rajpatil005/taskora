import express from 'express';
import {
  createTask,
  getNearbyTasks,
  getTaskDetails,
  acceptTask,
  completeTask,
  confirmCompletion,
  getUserTasks,
  cancelTask
} from '../controllers/taskController.js';
import { protectRoute } from '../middleware/auth.js';
import { createTaskValidation, taskIdValidation } from '../middleware/taskValidation.js';

const router = express.Router();

// Public routes
router.get('/nearby', protectRoute, getNearbyTasks);
router.get('/:id', protectRoute, taskIdValidation, getTaskDetails);

// Protected routes
router.post('/', protectRoute, createTaskValidation, createTask);
router.post('/:id/accept', protectRoute, taskIdValidation, acceptTask);
router.post('/:id/complete', protectRoute, taskIdValidation, completeTask);
router.post('/:id/confirm', protectRoute, taskIdValidation, confirmCompletion);
router.post('/:id/cancel', protectRoute, taskIdValidation, cancelTask);
router.get('/user/list', protectRoute, getUserTasks);

export default router;

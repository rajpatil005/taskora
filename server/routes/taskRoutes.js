import express from "express";
import {
  createTask,
  getNearbyTasks,
  getTaskDetails,
  acceptTask,
  completeTask,
  confirmCompletion,
  getUserTasks,
  cancelTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protectRoute } from "../middleware/auth.js";
import {
  createTaskValidation,
  taskIdValidation,
} from "../middleware/taskValidation.js";

const router = express.Router();

// Task lists
router.get("/nearby", protectRoute, getNearbyTasks);
router.get("/user/list", protectRoute, getUserTasks);

// Task details
router.get("/:id", protectRoute, taskIdValidation, getTaskDetails);

// Task actions
router.post("/", protectRoute, createTaskValidation, createTask);
router.post("/:id/accept", protectRoute, taskIdValidation, acceptTask);
router.post("/:id/complete", protectRoute, taskIdValidation, completeTask);
router.post("/:id/confirm", protectRoute, taskIdValidation, confirmCompletion);
router.post("/:id/cancel", protectRoute, taskIdValidation, cancelTask);

// Owner task handling
router.put("/:id", protectRoute, taskIdValidation, updateTask); // Update task
router.delete("/:id", protectRoute, taskIdValidation, deleteTask); // Delete task

export default router;

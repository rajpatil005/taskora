import express from "express";
import {
  register,
  login,
  getCurrentUser,
  googleLogin,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.js";
import {
  registerValidation,
  loginValidation,
} from "../middleware/validation.js";

const router = express.Router();

router.post("/google", googleLogin);
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", protectRoute, getCurrentUser);

export default router;

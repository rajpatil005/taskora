import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import { generateToken } from "../config/jwt.js";
import { validationResult } from "express-validator";
import { createNotification } from "./notificationController.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SIGNUP_BONUS = 100;

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    // VERIFY GOOGLE TOKEN
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture } = payload;

    // CHECK IF USER EXISTS
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: "google_oauth",
        profilePhoto: picture || null,
        avatarSeed: null, // we set below
      });

      await user.save();

      // stable seed for DiceBear
      user.avatarSeed = user._id.toString();
      await user.save();

      const wallet = new Wallet({
        user: user._id,
        balance: SIGNUP_BONUS,
      });
      await wallet.save();

      user.wallet = wallet._id;
      await user.save();

      await createNotification(
        user._id,
        "🎉 Welcome to Taskora! You received ₹100 signup bonus.",
        "system",
        req,
      );
    }

    // GENERATE TOKEN
    const token = generateToken(user._id);

    // PROFILE IMAGE
    const safePicture = picture?.replace("=s96-c", "=s400-c");

    res.json({
      message: "Google login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto || safePicture,
        avatarSeed: user.avatarSeed,
      },
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      profilePhoto: null,
      avatarSeed: null,
    });

    await user.save();

    // create wallet FIRST
    const wallet = new Wallet({
      user: user._id,
      balance: SIGNUP_BONUS,
    });
    await wallet.save();

    await createNotification(
      user._id,
      "🎉 Welcome to Taskora! You received ₹100 signup bonus.",
      "system",
      req,
    );

    user.wallet = wallet._id;
    user.avatarSeed = user._id.toString();
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarSeed: user.avatarSeed,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🚨 BLOCK GOOGLE USERS FROM PASSWORD LOGIN
    if (user.password === "google_oauth") {
      return res.status(400).json({
        message: "Please login using Google",
      });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        rating: user.rating,
        completedTasks: user.completedTasks,
        avatarSeed: user.avatarSeed,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wallet");

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        location: user.location,
        rating: user.rating,
        completedTasks: user.completedTasks,
        verificationStatus: user.verificationStatus,
        wallet: user.wallet,
        avatarSeed: user.avatarSeed,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

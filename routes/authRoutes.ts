import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import {
  createUser,
  getUserById,
  loginUser,
  sendOTP,
  verify,
  verifyUser,
} from "../services/userService";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to create user",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    res.status(401).json({
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
});

router.post("/send-otp/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await sendOTP(userId);
    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to send OTP",
    });
  }
});

router.post("/verify/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { otp } = req.body;
    await verify(userId, otp);
    res.status(200).json({
      message: "User verified successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to verify user",
    });
  }
});

router.use(authenticateUser);

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user?.id !== req.params.userId && req.user?.role !== "admin") {
      res.status(403).json({ message: "Access denied" });
    }
    const user = await getUserById(userId);
    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : "User not found",
    });
  }
});

export default router;

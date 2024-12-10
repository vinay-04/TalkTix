import express from "express";
import {
  createSpeakerProfile,
  getSpeakerById,
  getSpeakerByEmail,
  getAllSpeakers,
  deleteSpeakerProfile,
  sendOTP,
  verify,
  updateSpeakerProfile,
  loginSpeaker,
} from "../services/speaker.service";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const speakers = await getAllSpeakers();
    res.status(200).json(speakers);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const speaker = await getSpeakerById(userId);
    res.status(200).json(speaker);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const profileData = req.body;
    const speaker = await createSpeakerProfile(profileData);
    res.status(201).json(speaker);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { speaker, token } = await loginSpeaker(req.body);
    res.status(200).json({
      message: "Login successful",
      speaker,
      token,
    });
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : "Login failed",
    });
  }
});

router.use(authenticateUser);

router.post("/send-otp/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await sendOTP(userId);
    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to send OTP",
    });
  }
});

router.post("/verify/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { otp } = req.body;
    const user = await verify(userId, otp);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to verify OTP",
    });
  }
});

router.put("/update/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;
    const updatedSpeaker = await updateSpeakerProfile(userId, profileData);
    res.status(200).json(updatedSpeaker);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedSpeaker = await deleteSpeakerProfile(userId);
    res.status(200).json(deletedSpeaker);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

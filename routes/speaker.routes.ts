import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import {
  createSpeakerProfile,
  deleteSpeakerProfile,
  getAllSpeakers,
  getSpeakerByEmail,
  getSpeakerById,
  loginSpeaker,
  sendOTP,
  updateSpeakerProfile,
  verify,
} from "../services/speaker.service";

const router = express.Router();

/**
 * @swagger
 * /api/v1/speaker:
 *   get:
 *     summary: Get all speakers
 *     tags: [Speakers]
 *     responses:
 *       200:
 *         description: List of all speakers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/v1/speaker/{userId}:
 *   get:
 *     summary: Get a speaker by their ID
 *     tags: [Speakers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID of the speaker
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Speaker details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/v1/speaker/signup:
 *   post:
 *     summary: Create a new speaker profile
 *     tags: [Speakers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       201:
 *         description: Speaker profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/v1/speaker/login:
 *   post:
 *     summary: Log in a speaker
 *     tags: [Speakers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 speaker:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
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

/**
 * @swagger
 * /api/v1/speaker/send-otp/{userId}:
 *   post:
 *     summary: Send OTP to the speaker for verification
 *     tags: [Speakers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The speaker ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Failed to send OTP
 */
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

/**
 * @swagger
 * /api/v1/speaker/verify/{userId}:
 *   post:
 *     summary: Verify speaker's OTP
 *     tags: [Speakers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The speaker ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 description: OTP code for verification
 *     responses:
 *       200:
 *         description: Speaker verified successfully
 *       400:
 *         description: Invalid OTP or verification failed
 */
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

/**
 * @swagger
 * /api/v1/speaker/update/{userId}:
 *   put:
 *     summary: Update speaker profile
 *     tags: [Speakers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The speaker ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/v1/speaker/delete/{userId}:
 *   delete:
 *     summary: Delete a speaker profile
 *     tags: [Speakers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The speaker ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       500:
 *         description: Internal server error
 */
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

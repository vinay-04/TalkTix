import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import {
  createUser,
  getUserById,
  getUsers,
  loginUser,
  sendOTP,
  verify,
} from "../services/user.service";

const router = Router();

/**
 * @swagger
 * /api/v1/user/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password for the user
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Failed to create user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to create user
 */
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

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *             required:
 *               - email
 *               - password
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
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: Authentication token
 *       401:
 *         description: Login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login failed
 */
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

/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *       404:
 *         description: Users not found
 */
router.get("/", async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : "User not found",
    });
  }
});

/**
 * @swagger
 * /api/v1/user/{userId}:
 *   get:
 *     summary: Get a user by their ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.get("/:userId", async (req, res) => {
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

router.use(authenticateUser);
/**
 * @swagger
 * /api/v1/user/send-otp/{userId}:
 *   post:
 *     summary: Send an OTP to the user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
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
      message: error instanceof Error ? error.message : "Failed to send OTP",
    });
  }
});

/**
 * @swagger
 * /api/v1/user/verify/{userId}:
 *   post:
 *     summary: Verify the user using OTP
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 description: The OTP code
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User verified successfully
 *       400:
 *         description: Failed to verify user
 */
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

export default router;

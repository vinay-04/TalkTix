import e, { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { getBookingById } from "../services/booking.service";
import {
  deleteUserBooking,
  getUserBookings,
  userBooking,
} from "../services/booking_users.service";
import { getUserById } from "../services/user.service";
import { sendCalendarInvite } from "../utils/calendarUtils";
import { sendEmailNotification } from "../utils/emailUtils";

const router = Router();

router.use(authenticateUser);

/**
 * @swagger
 * /api/v1/user-booking:
 *   get:
 *     summary: Get all bookings for a user
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of user bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bookingId:
 *                         type: string
 *                       sessionStartTime:
 *                         type: string
 *                       sessionEndTime:
 *                         type: string
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only users can access their bookings
 *       404:
 *         description: Bookings not found
 */
router.get("/bookings", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      throw new Error("User not authenticated");
    }
    const { id, role } = req.user;
    if (role !== "user") {
      res.status(403).json({
        message: "Only user",
      });
      throw new Error("Only users");
    }
    const user_id = id;
    const bookings = await getUserBookings(user_id);
    res.status(200).json({
      bookings,
    });
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : "Bookings not found",
    });
  }
});

/**
 * @swagger
 * /api/v1/user-booking:
 *   post:
 *     summary: Create a new booking for the user
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *               sessionStartTime:
 *                 type: string
 *               sessionEndTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookingId:
 *                   type: string
 *                 sessionStartTime:
 *                   type: string
 *                 sessionEndTime:
 *                   type: string
 *       400:
 *         description: Failed to create booking
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only users can create bookings
 */
router.post("/book", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      throw new Error("User not authenticated");
    }
    const { id, role } = req.user;
    if (role !== "user") {
      res.status(403).json({
        message: "Only user can create bookings",
      });
      throw new Error("Only users can create bookings");
    }
    const booking = await userBooking({ userId: id, ...req.body });
    const user = await getUserById(id);
    sendEmailNotification(user.email, booking.booking[0].bookingId);
    const slot = getBookingById(booking.booking[0].bookingId);
    sendCalendarInvite(
      user.firstName,
      user.email,
      (await slot).sessionStartTime.toString(),
      (await slot).sessionEndTime.toString(),
    );
    res.status(201).json({
      booking,
    });
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to create booking",
    });
  }
});

/**
 * @swagger
 * /api/v1/user-booking:
 *   post:
 *     summary: Delete a user booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       400:
 *         description: Failed to delete booking
 *       401:
 *         description: Authentication required
 */
router.post("/delete", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      throw new Error("User not authenticated");
    }
    const { id, role } = req.user;
    const booking = await deleteUserBooking(id, req.body);
    res.status(201).json({
      message: "Booking deleted successfully",
      booking,
    });
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to delete booking",
    });
  }
});

export default router;

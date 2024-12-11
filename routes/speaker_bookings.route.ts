import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { getBookingById } from "../services/booking.service";
import {
  deleteSpeakerBooking,
  getSpeakerBookings,
  speakerBooking,
} from "../services/booking_speaker.service";
import { getSpeakerById } from "../services/speaker.service";
import { sendCalendarInvite } from "../utils/calendarUtils";
import { sendEmailNotification } from "../utils/emailUtils";

const router = Router();

router.use(authenticateUser);

/**
 * @swagger
 * /api/v1/speaker-booking:
 *   get:
 *     summary: Get all bookings for a speaker
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of speaker bookings
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
    const speaker_id = req.user?.id;
    const bookings = await getSpeakerBookings(speaker_id);
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
 * /api/v1/speaker-booking:
 *   post:
 *     summary: Create a new booking for the speaker
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *         description: Booking time should be between 9am to 4pm and in one-hour duration
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only speakers can create bookings
 */
router.post("/api/v1/speaker-booking", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      throw new Error("User not authenticated");
    }
    const { id, role } = req.user;
    if (role !== "speaker") {
      res.status(403).json({
        message: "Only speakers can create bookings",
      });
      throw new Error("Only speakers can create bookings");
    }

    const { sessionStartTime, sessionEndTime } = req.body;
    const startHour = new Date(sessionStartTime).getUTCHours();
    const endHour = new Date(sessionEndTime).getUTCHours();
    const startMinutes = new Date(sessionStartTime).getUTCMinutes();
    const endMinutes = new Date(sessionEndTime).getUTCMinutes();

    if (
      startHour < 9 ||
      endHour > 16 ||
      startMinutes !== 0 ||
      endMinutes !== 0 ||
      endHour - startHour !== 1
    ) {
      res.status(400).json({
        message:
          "Booking time should be between 9am to 4pm and in one-hour duration",
      });
      return;
    }

    const booking = await speakerBooking({ speakerId: id, ...req.body });
    const user = await getSpeakerById(id);
    sendEmailNotification(user.email, booking.speakerBooking[0].bookingId);
    const slot = getBookingById(booking.speakerBooking[0].bookingId);

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
    console.log(error);
    res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to create booking",
    });
  }
});

/**
 * @swagger
 * /api/v1/speaker-booking:
 *   post:
 *     summary: Delete a booking for the speaker
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
 *       201:
 *         description: Booking deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookingId:
 *                   type: string
 *       400:
 *         description: Failed to delete booking
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only speakers can delete bookings
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
    if (role !== "speaker") {
      res.status(403).json({
        message: "Only speakers can delete bookings",
      });
      throw new Error("Only speakers can create bookings");
    }

    const { bookingId } = req.body;
    const booking = await deleteSpeakerBooking(id, bookingId);
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

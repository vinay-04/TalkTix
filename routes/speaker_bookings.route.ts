import { Router } from "express";
import {
  deleteSpeakerBooking,
  getSpeakerBookings,
  speakerBooking,
} from "../services/booking_speaker.service";
import { authenticateUser } from "../middleware/authMiddleware";
import { getSpeakerById } from "../services/speaker.service";
import { sendEmailNotification } from "../utils/emailUtils";
import { getBookingById } from "../services/booking.service";
import { sendCalendarInvite } from "../utils/calendarUtils";

const router = Router();

router.use(authenticateUser);
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

router.post("/book", async (req, res) => {
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

import e, { Router } from "express";
import {
  deleteUserBooking,
  getUserBookings,
  userBooking,
} from "../services/booking_users.service";
import { authenticateUser } from "../middleware/authMiddleware";
import { sendEmailNotification } from "../utils/emailUtils";
import { getUserById } from "../services/user.service";
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

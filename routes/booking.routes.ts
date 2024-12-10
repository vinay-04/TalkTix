import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
} from "../services/booking.service";
import { BookingCreateSchema } from "../schema/zodSchemas";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bookings = await getBookings();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await getBookingById(bookingId);
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/create", authenticateUser, async (req, res) => {
  try {
    const bookingData = BookingCreateSchema.parse(req.body);
    const booking = await createBooking(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/cancel/:bookingId", authenticateUser, async (req, res) => {
  try {
    const { bookingId } = req.params;
    await cancelBooking(bookingId);
    res.status(200).json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

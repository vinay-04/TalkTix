import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
} from "../services/bookingService";
import { BookingCreateSchema } from "../schema/zodSchemas";

const router = express.Router();

router.post("/bookings", async (req, res) => {
  try {
    const bookingData = BookingCreateSchema.parse(req.body);
    const booking = await createBooking(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await getBookings();
    res.status(200).json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

router.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (booking) {
      res.status(200).json(booking);
    } else {
      res.status(404).json({ error: "Booking not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

router.put("/bookings/:id/cancel", async (req, res) => {
  try {
    const booking = await cancelBooking(req.params.id);
    if (booking) {
      res.status(200).json(booking);
    } else {
      res.status(404).json({ error: "Booking not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

export default router;

import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
} from "../services/booking.service";
import { BookingCreateSchema } from "../schema/zodSchemas";
import { authenticateUser } from "../middleware/authMiddleware";
import { redis } from "../config/config";

const router = express.Router();

const generateCacheKey = (key: string) => `bookings:${key}`;

const sendResponse = <T>(
  res: express.Response,
  statusCode: number,
  data: T,
) => {
  if (!res.headersSent) {
    return res.status(statusCode).json(data);
  }
  console.error("Attempted to send multiple responses");
  return null;
};

router.get("/", async (req, res) => {
  const cacheKey = generateCacheKey("all");

  try {
    console.log(`Fetching bookings, cache key: ${cacheKey}`);

    const cachedBookings = await redis.get(cacheKey);

    if (cachedBookings) {
      console.log("Returning cached bookings");
      sendResponse(res, 200, JSON.parse(cachedBookings));
    }

    console.log("No cached bookings, fetching from database");

    const bookings = await getBookings();

    await redis.set(cacheKey, JSON.stringify(bookings), "EX", 3600);

    console.log("Sending bookings from database");
    sendResponse(res, 200, bookings);
  } catch (error) {
    console.error("Booking fetch error:", error);

    sendResponse(res, 500, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  const cacheKey = generateCacheKey(bookingId);

  try {
    console.log(
      `Fetching booking, bookingId: ${bookingId}, cache key: ${cacheKey}`,
    );

    const cachedBooking = await redis.get(cacheKey);

    if (cachedBooking) {
      console.log("Returning cached booking");
      sendResponse(res, 200, JSON.parse(cachedBooking));
    }

    console.log("No cached booking, fetching from database");

    const booking = await getBookingById(bookingId);

    await redis.set(cacheKey, JSON.stringify(booking), "EX", 3600);

    console.log("Sending booking from database");
    sendResponse(res, 200, booking);
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") {
      console.log("Booking not found");
      sendResponse(res, 404, { error: "Booking not found" });
    }

    console.error("Booking fetch error:", error);

    sendResponse(res, 500, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const invalidateBookingCache = async (bookingId?: string) => {
  const allCacheKey = generateCacheKey("all");

  try {
    if (bookingId) {
      const specificCacheKey = generateCacheKey(bookingId);
      await Promise.all([redis.del(allCacheKey), redis.del(specificCacheKey)]);
      console.log(
        `Invalidated cache for booking ${bookingId} and all bookings`,
      );
    } else {
      await redis.del(allCacheKey);
      console.log("Invalidated all bookings cache");
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
};

router.post("/", authenticateUser, async (req, res) => {
  try {
    const newBooking = await createBooking(req.body);
    await invalidateBookingCache();

    sendResponse(res, 201, newBooking);
  } catch (error) {
    sendResponse(res, 500, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/create", authenticateUser, async (req, res) => {
  try {
    const bookingData = BookingCreateSchema.parse(req.body);
    const booking = await createBooking(bookingData);
    await invalidateBookingCache();

    sendResponse(res, 201, booking);
  } catch (error) {
    sendResponse(res, 500, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/cancel/:bookingId", authenticateUser, async (req, res) => {
  try {
    const { bookingId } = req.params;
    await cancelBooking(bookingId);
    await invalidateBookingCache(bookingId);

    sendResponse(res, 200, {
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    sendResponse(res, 500, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

import express from "express";
import { redis } from "../config/config";
import { authenticateUser } from "../middleware/authMiddleware";
import { BookingCreateSchema } from "../schema/zodSchemas";
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getBookings,
} from "../services/booking.service";

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

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: API for managing bookings
 */

/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Retrieve all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: A list of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bookingId:
 *                     type: string
 *                   customerName:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /api/v1/bookings/{bookingId}:
 *   get:
 *     summary: Retrieve a specific booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking ID
 *     responses:
 *       200:
 *         description: A specific booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookingId:
 *                   type: string
 *                 customerName:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/v1/bookings/create:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *                 description: The name of the customer making the booking
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the booking
 *
 *             required:
 *               - customerName
 *               - date
 *     responses:
 *       201:
 *         description: The created booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookingId:
 *                   type: string
 *                 customerName:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *       400:
 *         description: Bad Request (e.g., invalid input)
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/v1/bookings/cancel/{bookingId}:
 *   post:
 *     summary: Cancel a booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking ID to cancel
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       500:
 *         description: Internal server error
 */
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

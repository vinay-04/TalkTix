import type { Request, Response } from "express";
import express from "express";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { redis, pool } from "./config/config";
import * as schema from "./schema/schema";
import userRoutes from "./routes/user.routes";
import speakerRoutes from "./routes/speaker.routes";
import bookingRoutes from "./routes/booking.routes";
import userBookingRoutes from "./routes/user_booking.routes";
import speakerBookingRoutes from "./routes/speaker_bookings.route";
import { Logger } from "./middleware/logMiddleware";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = drizzle(pool, { schema });

app.use(Logger);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/speaker", speakerRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/user-booking", userBookingRoutes);
app.use("/api/v1/speaker-booking", speakerBookingRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to TalkTix! :)");
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    const dbResult = await pool.query("SELECT NOW()");
    const redisResult = await redis.ping();
    res.json({
      status: "healthy",
      postgres: !!dbResult.rows[0],
      redis: redisResult === "PONG",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

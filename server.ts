import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Request, Response } from "express";
import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { pool, redis, swaggerDefinition } from "./config/config";
import { Logger } from "./middleware/logMiddleware";
import bookingRoutes from "./routes/booking.routes";
import speakerRoutes from "./routes/speaker.routes";
import speakerBookingRoutes from "./routes/speaker_bookings.route";
import userRoutes from "./routes/user.routes";
import userBookingRoutes from "./routes/user_booking.routes";
import * as schema from "./schema/schema";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

drizzle(pool, { schema });

app.use(Logger);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/speaker", speakerRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/user-booking", userBookingRoutes);
app.use("/api/v1/speaker-booking", speakerBookingRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     description: Welcome message for TalkTix API
 *     responses:
 *       200:
 *         description: Returns welcome message
 */
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

const options = {
  swaggerDefinition,
  apis: ["./routes/*.ts", "server.ts"],
};

const swaggerSpec = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

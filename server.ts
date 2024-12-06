import type { Request, Response } from "express";
import express from "express";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { redis, pool } from "./config/config";
import * as schema from "./schema/schema";
import authRoutes from "./routes/authRoutes";
import speakerRoutes from "./routes/speakerRoutes";
import bookingRoutes from "./routes/bookingRoutes";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = drizzle(pool, { schema });

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/speakers", speakerRoutes);
app.use("/api/v1/bookings", bookingRoutes);

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

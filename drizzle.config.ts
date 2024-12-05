import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});

export default {
  schema: "./schema/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.POSTGRES_HOST || "localhost",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "",
    database: process.env.POSTGRES_DB || "talktix",
    port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
  },
  verbose: true,
  strict: true,
} satisfies Config;

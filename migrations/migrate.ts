import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import dotenv from "dotenv";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT),
});

const db = drizzle(pool);

async function ensureMigrationFolders() {
  const migrationsPath = path.join(process.cwd(), "drizzle");
  const metaPath = path.join(migrationsPath, "meta");

  if (!existsSync(migrationsPath)) {
    await mkdir(migrationsPath, { recursive: true });
  }
  if (!existsSync(metaPath)) {
    await mkdir(metaPath, { recursive: true });
  }
}

async function main() {
  try {
    console.log("Ensuring migration folders exist...");
    await ensureMigrationFolders();

    console.log("Migration started...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migration completed!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

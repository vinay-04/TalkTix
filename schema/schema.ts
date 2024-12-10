import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

const generateUlid = () => ulid();

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUlid()),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const speakers = pgTable("speakers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUlid()),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  isVerified: boolean("is_verified").default(false),
  pricePerSession: numeric("price_per_session", {
    precision: 10,
    scale: 2,
  }).notNull(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUlid()),
  sessionStartTime: timestamp("start_time").notNull(),
  sessionEndTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookingSpeakers = pgTable("booking_speakers", {
  bookingId: text("slot_id")
    .notNull()
    .references(() => bookings.id),
  speakerId: text("speaker_id")
    .notNull()
    .references(() => speakers.id),
});

export const bookingUsers = pgTable("booking_users", {
  bookingId: text("slot_id")
    .notNull()
    .references(() => bookings.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
});

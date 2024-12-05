import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  numeric,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { ulid } from "ulid";

export const users = pgTable("users", {
  id: text("id").primaryKey().default(ulid()),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  userType: text("user_type").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const speakers = pgTable("speakers", {
  id: text("id").primaryKey().default(ulid()),
  userId: text("user_id")
    .references(() => users.id)
    .unique(),
  pricePerSession: numeric("price_per_session", {
    precision: 10,
    scale: 2,
  }).notNull(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().default(ulid()),
  userId: text("user_id").references(() => users.id),
  speakerId: text("speaker_id").references(() => speakers.id),
  sessionStartTime: timestamp("session_start_time").notNull(),
  sessionEndTime: timestamp("session_end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const speakerRelations = relations(speakers, ({ one, many }) => ({
  user: one(users, {
    fields: [speakers.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const bookingRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  speaker: one(speakers, {
    fields: [bookings.speakerId],
    references: [speakers.id],
  }),
}));

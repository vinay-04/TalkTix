import type { z } from "zod";
import type { BookingCreateSchema } from "../schema/zodSchemas";
import { bookings } from "../schema/schema";
import { db } from "../config/db";
import { eq } from "drizzle-orm";

type BookingCreateSchemaType = z.infer<typeof BookingCreateSchema>;

export const createBooking = async (bookingData: BookingCreateSchemaType) => {
  try {
    const [booking] = await db
      .insert(bookings)
      .values({
        sessionStartTime: bookingData.sessionStartTime,
        sessionEndTime: bookingData.sessionEndTime,
        createdAt: new Date(),
      })
      .returning({
        id: bookings.id,
        sessionStartTime: bookings.sessionStartTime,
        sessionEndTime: bookings.sessionEndTime,
      });

    return booking;
  } catch (error: unknown) {
    throw new Error(
      `Error creating booking: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getBookings = async () => {
  try {
    const bookingsList = await db.select().from(bookings);
    return bookingsList;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching bookings: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
export const getBookingById = async (id: string) => {
  try {
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);
    return booking[0];
  } catch (error: unknown) {
    throw new Error(
      `Error fetching booking: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const checkStartTime = async (startTime: Date): Promise<boolean> => {
  try {
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.sessionStartTime, startTime))
      .limit(1);
    return booking.length > 0;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching booking: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const cancelBooking = async (id: string) => {
  try {
    const [booking] = await db
      .delete(bookings)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  } catch (error: unknown) {
    throw new Error(
      `Error cancelling booking: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

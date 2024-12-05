import type { z } from "zod";
import type {
  BookingCreateSchema,
  BookingUpdateSchema,
} from "../schema/zodSchemas";
import { bookings } from "../schema/schema";
import { db } from "../config/db";

type BookingCreateSchemaType = z.infer<typeof BookingCreateSchema>;
type BookingUpdateSchemaType = z.infer<typeof BookingUpdateSchema>;

export const createBooking = async (bookingData: BookingCreateSchemaType) => {
  try {
    const [booking] = await db
      .insert(bookings)
      .values({
        ...bookingData,
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

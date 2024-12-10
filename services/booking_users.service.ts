import { bookingUsers } from "../schema/schema";
import { db } from "../config/db";
import type { UserBookingSchema } from "../schema/zodSchemas";
import type z from "zod";
import { eq } from "drizzle-orm";

type UserBookingSchemaType = z.infer<typeof UserBookingSchema>;

export const userBooking = async (bookingData: UserBookingSchemaType) => {
  try {
    const booking = await db
      .insert(bookingUsers)
      .values({
        ...bookingData,
      })
      .returning({
        bookingId: bookingUsers.bookingId,
        userId: bookingUsers.userId,
      });

    return {
      message: "Booking created successfully",
      booking: booking,
    };
  } catch (error: unknown) {
    throw new Error(
      `Error creating booking: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getUserBookings = async (userId: string) => {
  try {
    const userBookings = await db
      .select()
      .from(bookingUsers)
      .where(eq(bookingUsers.userId, userId));
    return userBookings;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching bookings: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const deleteUserBooking = async (bookingId: string, userId: string) => {
  try {
    const deletedBooking = await db
      .delete(bookingUsers)
      .where(
        eq(bookingUsers.bookingId, bookingId) &&
          eq(bookingUsers.userId, userId),
      );
    return {
      message: "Booking deleted successfully",
      booking: deletedBooking,
    };
  } catch (error: unknown) {
    throw new Error(
      `Error deleting booking: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
